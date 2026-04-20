// ナレッジ管理関連の型定義

export type UsageContext = "dm_email" | "chatbot" | "both"

export interface KnowledgeItemSummary {
  id: string
  serviceId: string | null
  categoryId: string
  title: string
  contentSummary: string | null
  usageContext: UsageContext | null
  isActive: boolean
  version: number
  updatedAt: Date
  service: {
    slug: string
    name: string
  } | null
  category: {
    slug: string
    name: string
  }
  tags: {
    id: string
    name: string
  }[]
}

export interface KnowledgeItemDetail extends KnowledgeItemSummary {
  content: string
  sourceNote: string | null
  createdAt: Date
  versions: {
    id: string
    version: number
    changedAt: Date
    changeNote: string | null
  }[]
}

export interface ServiceSummary {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  targetAudience: string | null
  isActive: boolean
  displayOrder: number
  knowledgeCount: number
}
