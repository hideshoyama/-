// CSVインポート関連の型定義

export type ImportSourceName = "MUSUBU" | "Urizo" | "custom"

export type ImportStatus = "completed" | "failed" | "partial"

export interface ImportResult {
  sessionId: string
  fileName: string
  totalRows: number
  importedRows: number
  skippedRows: number
  duplicateRows: number
  status: ImportStatus
  errorLog: string | null
  duplicateCandidates: DuplicateCandidate[]
}

export interface DuplicateCandidate {
  rowIndex: number
  incomingData: Record<string, string>
  matchedCompanyId: string
  matchedCompanyName: string
  matchReason: "corporate_number" | "name_prefecture" | "phone"
  confidence: "high" | "medium" | "low"
}

// MUSUBUのCSVカラム定義
export interface MusubuRow {
  会社名: string
  会社名ひらがな?: string
  会社サイト?: string
  お問い合わせページ?: string
  本社採用メールアドレス?: string
  法人番号?: string
  設立年月?: string
  代表者名?: string
  役員情報?: string
  従業員数?: string
  上場種別?: string
  資本金?: string
  売上高?: string
  決算月?: string
  事業所数?: string
  工場数?: string
  店舗数?: string
  一言説明?: string
  会社概要?: string
  メイン大業界?: string
  メイン小業界?: string
  サブ大業界?: string
  サブ小業界?: string
  事業内容キーワード?: string
  "特徴（BtoB/BtoC等）"?: string
  事業所名?: string
  事業所名ひらがな?: string
  事業所分類1?: string
  事業所分類2?: string
  事業所分類3?: string
  住所?: string
  住所種別?: string
  郵便番号?: string
  都道府県?: string
  市区町村以降?: string
  "登記住所（郵便番号）"?: string
  登記住所?: string
  電話番号?: string
  FAX番号?: string
  メールアドレス?: string
  求人募集職種?: string
  最新の求人登録日?: string
  "推定求人出稿額（年）"?: string
  求人URL?: string
}

// UrizoのCSVカラム定義
export interface UrizoRow {
  会社名: string
  郵便番号?: string
  住所?: string
  電話番号?: string
  FAX?: string
  メール?: string
  URL?: string
  データ元?: string
  業種?: string
  業種詳細?: string
  コメント?: string
  日付?: string
  最終更新日?: string
  メモ?: string
  設立日?: string
  売上高?: string
  従業員数?: string
  資本金?: string
  代表者名?: string
  担当者名?: string
  お問い合わせフォーム?: string
  職種?: string
  法人番号?: string
}

// カスタムマッピング設定
export interface CustomColumnMapping {
  targetField: string       // DBの対象フィールド名
  csvColumn: string         // CSVのカラム名
  transform?: string        // 変換方法（"number", "bigint", "date" など）
}
