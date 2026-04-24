import { prisma } from "@/lib/db/client"
import type { DuplicateCandidate } from "@/types/import"

interface IncomingData {
  name: string
  corporateNumber?: string | null
  phone?: string | null
  prefecture?: string | null
}

// 重複候補を検出する
export async function detectDuplicates(
  incoming: IncomingData,
  rowIndex: number,
  rawRow: Record<string, string>
): Promise<DuplicateCandidate | null> {
  // 1. 法人番号で完全一致（最優先）
  if (incoming.corporateNumber) {
    const match = await prisma.company.findUnique({
      where: { corporateNumber: incoming.corporateNumber },
    })
    if (match) {
      return {
        rowIndex,
        incomingData: rawRow,
        matchedCompanyId: match.id,
        matchedCompanyName: match.name,
        matchReason: "corporate_number",
        confidence: "high",
      }
    }
  }

  // 2. 会社名＋都道府県で一致
  if (incoming.name && incoming.prefecture) {
    const matches = await prisma.company.findMany({
      where: { name: incoming.name },
      include: { offices: { where: { prefecture: incoming.prefecture } } },
    })
    const match = matches.find((m) => m.offices.length > 0)
    if (match) {
      return {
        rowIndex,
        incomingData: rawRow,
        matchedCompanyId: match.id,
        matchedCompanyName: match.name,
        matchReason: "name_prefecture",
        confidence: "medium",
      }
    }
  }

  // 3. 電話番号で一致
  if (incoming.phone) {
    const normalizedPhone = incoming.phone.replace(/[-\s]/g, "")
    const contactMatch = await prisma.contact.findFirst({
      where: {
        contactType: "phone",
        value: { contains: normalizedPhone },
      },
      include: { company: true },
    })
    if (contactMatch) {
      return {
        rowIndex,
        incomingData: rawRow,
        matchedCompanyId: contactMatch.company.id,
        matchedCompanyName: contactMatch.company.name,
        matchReason: "phone",
        confidence: "low",
      }
    }
  }

  return null
}
