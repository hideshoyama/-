// メール関連の型定義

export interface MailTemplate {
  id: string
  name: string
  subject: string
  body: string
  serviceId: string
  createdAt: Date
  updatedAt: Date
}

export interface GenerateMailRequest {
  companyId: string
  serviceId: string
  templateHint?: string   // 生成の方向性ヒント
}

export interface GenerateMailResponse {
  subject: string
  body: string
  usedKnowledgeIds: string[]  // 参照したナレッジIDリスト
}

export interface SendMailRequest {
  mailGenerationId: string
  useEditedBody?: boolean  // trueなら手動編集後の本文を使用
}

export type SendStatus = "sent" | "failed" | "bounced"

export interface SendLogEntry {
  id: string
  mailGenerationId: string
  sentAt: Date
  sentTo: string
  status: SendStatus
  errorMessage: string | null
}
