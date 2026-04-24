import { prisma } from "@/lib/db/client"
import { mapMusubuRow } from "./musubu"
import { mapUrizoRow } from "./urizo"
import { detectDuplicates } from "@/lib/duplicate-detector"
import type { ImportSourceName, ImportResult, DuplicateCandidate } from "@/types/import"

export async function runImport(
  sourceName: ImportSourceName,
  rows: Record<string, string>[],
  fileName: string,
  sourceId: string
): Promise<ImportResult> {
  let importedRows = 0
  let skippedRows = 0
  let duplicateRows = 0
  const errors: string[] = []
  const duplicateCandidates: DuplicateCandidate[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      const mapped = sourceName === "MUSUBU"
        ? mapMusubuRow(row as never)
        : mapUrizoRow(row as never)

      if (!mapped.company.name) {
        skippedRows++
        continue
      }

      const phone = mapped.contacts.find((c) => c.contactType === "phone")?.value ?? null
      const prefecture = mapped.office?.prefecture ?? null

      const duplicate = await detectDuplicates(
        {
          name: mapped.company.name,
          corporateNumber: mapped.company.corporateNumber,
          phone,
          prefecture,
        },
        i,
        row
      )

      if (duplicate) {
        duplicateCandidates.push(duplicate)
        duplicateRows++
        continue
      }

      await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({ data: mapped.company })

        await tx.companyDetail.create({
          data: { companyId: company.id, ...mapped.detail },
        })

        if (mapped.office) {
          const office = await tx.office.create({
            data: { companyId: company.id, ...mapped.office },
          })
          for (const contact of mapped.contacts) {
            await tx.contact.create({
              data: { companyId: company.id, officeId: office.id, ...contact },
            })
          }
        } else {
          for (const contact of mapped.contacts) {
            await tx.contact.create({
              data: { companyId: company.id, ...contact },
            })
          }
        }

        if (mapped.jobPosting) {
          await tx.jobPosting.create({
            data: { companyId: company.id, ...mapped.jobPosting },
          })
        }

        await tx.companySource.create({
          data: {
            companyId: company.id,
            importSessionId: sourceId,
            sourceRowData: JSON.stringify(row),
          },
        })
      })

      importedRows++
    } catch (e) {
      errors.push(`行${i + 1}: ${e instanceof Error ? e.message : String(e)}`)
      skippedRows++
    }
  }

  const status = errors.length === 0 ? "completed" : importedRows > 0 ? "partial" : "failed"

  await prisma.importSession.update({
    where: { id: sourceId },
    data: {
      importedRows,
      skippedRows,
      duplicateRows,
      status,
      errorLog: errors.length > 0 ? errors.join("\n") : null,
    },
  })

  return {
    sessionId: sourceId,
    fileName,
    totalRows: rows.length,
    importedRows,
    skippedRows,
    duplicateRows,
    status,
    errorLog: errors.length > 0 ? errors.join("\n") : null,
    duplicateCandidates,
  }
}
