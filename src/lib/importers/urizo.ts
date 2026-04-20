import type { UrizoRow } from "@/types/import"

// UrizoのCSVカラム → DBフィールドのマッピング処理
export function mapUrizoRow(row: UrizoRow) {
  return {
    company: {
      name: row["会社名"] ?? "",
      nameKana: null,
      websiteUrl: row["URL"] ?? null,
      inquiryPageUrl: row["お問い合わせフォーム"] ?? null,
      corporateNumber: row["法人番号"] ?? null,
      representativeName: row["代表者名"] ?? null,
      executiveInfo: null,
      employeeCount: parseIntOrNull(row["従業員数"]),
      listingType: null,
      capitalAmount: parseBigIntOrNull(row["資本金"]),
      revenue: parseBigIntOrNull(row["売上高"]),
      fiscalMonth: null,
      officeCount: null,
      factoryCount: null,
      storeCount: null,
      foundedAt: parseDateOrNull(row["設立日"]),
      shortDescription: row["コメント"] ?? null,
    },
    detail: {
      mainIndustryLarge: row["業種"] ?? null,
      mainIndustrySmall: row["業種詳細"] ?? null,
      subIndustryLarge: null,
      subIndustrySmall: null,
      businessKeywords: row["職種"] ?? null,
      businessFeatures: null,
      companyOverview: row["メモ"] ?? null,
    },
    office: buildUrizoOffice(row),
    contacts: buildUrizoContacts(row),
    jobPosting: null,
  }
}

function buildUrizoOffice(row: UrizoRow) {
  if (!row["住所"] && !row["郵便番号"]) return null

  // 住所から都道府県を抽出（簡易）
  const prefecture = extractPrefecture(row["住所"])

  return {
    officeName: null,
    officeNameKana: null,
    officeCategory1: null,
    officeCategory2: null,
    officeCategory3: null,
    addressType: null,
    postalCode: row["郵便番号"] ?? null,
    prefecture,
    city: row["住所"] ? row["住所"].replace(prefecture ?? "", "") : null,
    fullAddress: row["住所"] ?? null,
    registeredPostalCode: null,
    registeredAddress: null,
    isHeadquarters: true,
  }
}

function buildUrizoContacts(row: UrizoRow) {
  const contacts = []

  if (row["メール"]) {
    contacts.push({
      contactType: "email" as const,
      value: row["メール"],
      isPrimary: true,
      label: null,
    })
  }

  if (row["電話番号"]) {
    contacts.push({
      contactType: "phone" as const,
      value: row["電話番号"],
      isPrimary: false,
      label: null,
    })
  }

  if (row["FAX"]) {
    contacts.push({
      contactType: "fax" as const,
      value: row["FAX"],
      isPrimary: false,
      label: null,
    })
  }

  if (row["お問い合わせフォーム"]) {
    contacts.push({
      contactType: "form" as const,
      value: row["お問い合わせフォーム"],
      isPrimary: false,
      label: "お問い合わせフォーム",
    })
  }

  return contacts
}

const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県",
]

function extractPrefecture(address: string | undefined): string | null {
  if (!address) return null
  return PREFECTURES.find((p) => address.startsWith(p)) ?? null
}

function parseIntOrNull(value: string | undefined): number | null {
  if (!value) return null
  const n = parseInt(value.replace(/[^0-9]/g, ""), 10)
  return isNaN(n) ? null : n
}

function parseBigIntOrNull(value: string | undefined): bigint | null {
  if (!value) return null
  const n = parseInt(value.replace(/[^0-9]/g, ""), 10)
  return isNaN(n) ? null : BigInt(n)
}

function parseDateOrNull(value: string | undefined): Date | null {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}
