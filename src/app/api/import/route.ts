import { NextRequest, NextResponse } from "next/server"
import Papa from "papaparse"
import { prisma } from "@/lib/db/client"
import { runImport } from "@/lib/importers/engine"
import type { ImportSourceName } from "@/types/import"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const sourceName = formData.get("source") as ImportSourceName | null

  if (!file || !sourceName) {
    return NextResponse.json({ error: "ファイルとソースを指定してください" }, { status: 400 })
  }

  const text = await file.text()
  const { data, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length > 0 && data.length === 0) {
    return NextResponse.json({ error: "CSVの解析に失敗しました" }, { status: 400 })
  }

  const importSource = await prisma.importSource.findFirst({
    where: { name: sourceName },
  })

  if (!importSource) {
    return NextResponse.json({ error: `インポートソース "${sourceName}" が見つかりません` }, { status: 400 })
  }

  const session = await prisma.importSession.create({
    data: {
      sourceId: importSource.id,
      fileName: file.name,
      totalRows: data.length,
      importedRows: 0,
      skippedRows: 0,
      duplicateRows: 0,
      status: "partial",
    },
  })

  const result = await runImport(sourceName, data, file.name, session.id)

  return NextResponse.json(result)
}
