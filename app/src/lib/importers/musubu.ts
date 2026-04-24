import type { MusubuRow } from "@/types/import"

// MUSUBUのCSVカラム → DBフィールドのマッピング処理
export function mapMusubuRow(row: MusubuRow) {
  return {
    company: {
      name: row["会社名"] ?? "",
      nameKana: row["会社名ひらがな"] ?? null,
      websiteUrl: row["会社サイト"] ?? null,
      inquiryPageUrl: row["お問い合わせページ"] ?? null,
      corporateNumber: row["法人番号"] ?? null,
      representativeName: row["代表者名"] ?? null,
      executiveInfo: row["役員情報"] ?? null,
      employeeCount: parseIntOrNull(row["従業員数"]),
      listingType: row["上場種別"] ?? null,
      capitalAmount: parseBigIntOrNull(row["資本金"]),
      revenue: parseBigIntOrNull(row["売上高"]),
      fiscalMonth: parseIntOrNull(row["決算月"]),
      officeCount: parseIntOrNull(row["事業所数"]),
      factoryCount: parseIntOrNull(row["工場数"]),
      storeCount: parseIntOrNull(row["店舗数"]),
      foundedAt: parseDateOrNull(row["設立年月"]),
      shortDescription: row["一言説明"] ?? null,
    },
    detail: {
      mainIndustryLarge: row["メイン大業界"] ?? null,
      mainIndustrySmall: row["メイン小業界"] ?? null,
      subIndustryLarge: row["サブ大業界"] ?? null,
      subIndustrySmall: row["サブ小業界"] ?? null,
      businessKeywords: row["事業内容キーワード"] ?? null,
      businessFeatures: row["特徴（BtoB/BtoC等）"] ?? null,
      companyOverview: row["会社概要"] ?? null,
    },
    office: {
      officeName: row["事業所名"] ?? null,
      officeNameKana: row["事業所名ひらがな"] ?? null,
      officeCategory1: row["事業所分類1"] ?? null,
      officeCategory2: row["事業所分類2"] ?? null,
      officeCategory3: row["事業所分類3"] ?? null,
      addressType: row["住所種別"] ?? null,
      postalCode: row["郵便番号"] ?? null,
      prefecture: row["都道府県"] ?? null,
      city: row["市区町村以降"] ?? null,
      fullAddress: row["住所"] ?? null,
      registeredPostalCode: row["登記住所（郵便番号）"] ?? null,
      registeredAddress: row["登記住所"] ?? null,
      isHeadquarters: true,
    },
    contacts: buildMusubuContacts(row),
    jobPosting: {
      jobTypes: row["求人募集職種"] ?? null,
      latestPostedAt: parseDateOrNull(row["最新の求人登録日"]),
      estimatedAnnualCost: parseBigIntOrNull(row["推定求人出稿額（年）"]),
      jobUrl: row["求人URL"] ?? null,
    },
  }
}

function buildMusubuContacts(row: MusubuRow) {
  const contacts = []

  if (row["本社採用メールアドレス"]) {
    contacts.push({
      contactType: "email" as const,
      value: row["本社採用メールアドレス"],
      isPrimary: true,
      label: "本社採用メール",
    })
  }

  if (row["メールアドレス"]) {
    contacts.push({
      contactType: "email" as const,
      value: row["メールアドレス"],
      isPrimary: !row["本社採用メールアドレス"],
      label: "事業所メール",
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

  if (row["FAX番号"]) {
    contacts.push({
      contactType: "fax" as const,
      value: row["FAX番号"],
      isPrimary: false,
      label: null,
    })
  }

  if (row["お問い合わせページ"]) {
    contacts.push({
      contactType: "form" as const,
      value: row["お問い合わせページ"],
      isPrimary: false,
      label: "お問い合わせフォーム",
    })
  }

  return contacts
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
