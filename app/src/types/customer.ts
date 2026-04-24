// 企業関連の型定義

export type ContactType = "email" | "phone" | "fax" | "form"

export type SalesStatus = "lead" | "approached" | "negotiating" | "closed"

export interface CompanyListItem {
  id: string
  corporateNumber: string | null
  name: string
  nameKana: string | null
  employeeCount: number | null
  listingType: string | null
  foundedAt: Date | null
  shortDescription: string | null
  createdAt: Date
  detail: {
    mainIndustryLarge: string | null
    mainIndustrySmall: string | null
    businessFeatures: string | null
  } | null
  contacts: {
    id: string
    contactType: ContactType
    value: string
    isPrimary: boolean
    label: string | null
  }[]
  offices: {
    id: string
    prefecture: string | null
    city: string | null
    isHeadquarters: boolean
  }[]
}

export interface CompanyDetail {
  id: string
  corporateNumber: string | null
  name: string
  nameKana: string | null
  websiteUrl: string | null
  inquiryPageUrl: string | null
  representativeName: string | null
  executiveInfo: string | null
  employeeCount: number | null
  listingType: string | null
  capitalAmount: bigint | null
  revenue: bigint | null
  fiscalMonth: number | null
  officeCount: number | null
  factoryCount: number | null
  storeCount: number | null
  foundedAt: Date | null
  shortDescription: string | null
  createdAt: Date
  updatedAt: Date
  detail: {
    mainIndustryLarge: string | null
    mainIndustrySmall: string | null
    subIndustryLarge: string | null
    subIndustrySmall: string | null
    businessKeywords: string | null
    businessFeatures: string | null
    companyOverview: string | null
  } | null
  offices: {
    id: string
    officeName: string | null
    officeNameKana: string | null
    officeCategory1: string | null
    officeCategory2: string | null
    officeCategory3: string | null
    addressType: string | null
    postalCode: string | null
    prefecture: string | null
    city: string | null
    fullAddress: string | null
    registeredPostalCode: string | null
    registeredAddress: string | null
    isHeadquarters: boolean
  }[]
  contacts: {
    id: string
    officeId: string | null
    contactType: ContactType
    value: string
    isPrimary: boolean
    label: string | null
  }[]
  jobPostings: {
    id: string
    jobTypes: string | null
    latestPostedAt: Date | null
    estimatedAnnualCost: bigint | null
    jobUrl: string | null
  }[]
  sources: {
    id: string
    sourceRowData: string
    createdAt: Date
    importSession: {
      fileName: string
      importedAt: Date
      source: {
        name: string
        displayName: string
      }
    }
  }[]
}

export interface CompanyFilterParams {
  keyword?: string
  mainIndustryLarge?: string
  mainIndustrySmall?: string
  prefecture?: string
  hasEmail?: boolean
  employeeCountMin?: number
  employeeCountMax?: number
  businessFeature?: string  // "BtoB" | "BtoC" など
  sourceId?: string
  page?: number
  perPage?: number
  sortBy?: "name" | "employeeCount" | "foundedAt" | "estimatedAnnualCost" | "createdAt"
  sortOrder?: "asc" | "desc"
}
