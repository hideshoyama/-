"use client"

import { useState } from "react"
import type { ImportResult } from "@/types/import"

export default function ImportPage() {
  const [source, setSource] = useState<"MUSUBU" | "Urizo">("MUSUBU")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("source", source)

    const res = await fetch("/api/import", { method: "POST", body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "インポートに失敗しました")
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">CSVインポート</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">インポートソース</label>
          <div className="flex gap-4">
            {(["MUSUBU", "Urizo"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={s}
                  checked={source === s}
                  onChange={() => setSource(s)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CSVファイル</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "インポート中..." : "インポート実行"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">インポート結果</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="合計行数" value={result.totalRows} />
            <Stat label="取込成功" value={result.importedRows} green />
            <Stat label="重複スキップ" value={result.duplicateRows} />
            <Stat label="エラースキップ" value={result.skippedRows - result.duplicateRows} />
          </dl>

          {result.duplicateCandidates.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">重複候補（{result.duplicateCandidates.length}件）</p>
              <div className="space-y-2">
                {result.duplicateCandidates.map((d, i) => (
                  <div key={i} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="font-medium">{d.incomingData["会社名"]}</span>
                    <span className="text-gray-500 ml-2">→ 既存: {d.matchedCompanyName}（{d.confidence}）</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errorLog && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 whitespace-pre-wrap">
              {result.errorLog}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, green }: { label: string; value: number; green?: boolean }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className={`text-lg font-bold ${green ? "text-green-600" : "text-gray-900"}`}>{value}</dd>
    </div>
  )
}
