import type { CustomColumnMapping } from "@/types/import"

// カスタムCSVマッピング処理
export function mapCustomRow(
  row: Record<string, string>,
  mappings: CustomColumnMapping[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const mapping of mappings) {
    const raw = row[mapping.csvColumn]
    if (!raw) continue

    switch (mapping.transform) {
      case "number":
        result[mapping.targetField] = parseInt(raw.replace(/[^0-9]/g, ""), 10) || null
        break
      case "bigint":
        result[mapping.targetField] = BigInt(parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0)
        break
      case "date":
        result[mapping.targetField] = new Date(raw) || null
        break
      case "boolean":
        result[mapping.targetField] = raw === "true" || raw === "1" || raw === "yes"
        break
      default:
        result[mapping.targetField] = raw
    }
  }

  return result
}
