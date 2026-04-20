# DBスキーマ設計（詳細）

## テーブル一覧

---

## ナレッジ管理系

### `business_profiles`（事業者プロフィール）
庄山FP事務所自体の基本情報。1レコード固定。

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| businessName | String | "庄山FP事務所" |
| ownerName | String | "庄山英俊" |
| ownerTitle | String? | "FP・DXコンサルタント" |
| description | String? | 事務所概要（長文） |
| websiteUrl | String? | |
| email | String? | |
| phone | String? | |
| address | String? | |
| foundedAt | DateTime? | |
| updatedAt | DateTime | 自動更新 |

---

### `services`（サービスマスタ）
提供サービスの一覧。人事評価制度以外も追加できる。

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| slug | String | UNIQUE。"hr-evaluation", "fp-consulting" など |
| name | String | "人事評価制度構築支援サービス" |
| shortDescription | String? | 一行説明 |
| targetAudience | String? | 対象顧客像（例: 従業員5〜300名の中小企業） |
| isActive | Boolean | デフォルト true |
| displayOrder | Int | 表示順 |
| createdAt | DateTime | |
| updatedAt | DateTime | 自動更新 |

---

### `knowledge_categories`（ナレッジカテゴリ）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| slug | String | UNIQUE。"overview" / "merit" / "pricing" / "case_study" / "faq" / "profile" / "differentiator" / "flow" |
| name | String | 表示名 |
| displayOrder | Int | 表示順 |

---

### `knowledge_items`（ナレッジ本体）
**中核テーブル。AIメール生成・チャットボット・RAGすべてのソース。**

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| serviceId | String? | NULL = 事務所全体共通ナレッジ |
| categoryId | String | FK → knowledge_categories |
| title | String | ナレッジタイトル |
| content | String | 本文（Markdown形式） |
| contentSummary | String? | 要約（AIが短く使いたい場合用） |
| usageContext | String? | "dm_email" / "chatbot" / "both" |
| sourceNote | String? | 出典・備考 |
| isActive | Boolean | デフォルト true |
| version | Int | バージョン番号 |
| embeddingModel | String? | 将来RAG用：使用embeddingモデル名 |
| embeddingVector | Bytes? | 将来RAG用：ベクトルデータ |
| embeddingUpdatedAt | DateTime? | 将来RAG用 |
| createdAt | DateTime | |
| updatedAt | DateTime | 自動更新 |

**ナレッジ構造例（人事評価制度）**

| serviceId | category | title |
|-----------|----------|-------|
| hr-evaluation | overview | サービス概要 |
| hr-evaluation | merit | 導入メリット（離職率改善・採用力向上・生産性向上） |
| hr-evaluation | differentiator | 差別化ポイント（AI/DX活用・FP視点の財務連動） |
| hr-evaluation | pricing | 料金体系 |
| hr-evaluation | flow | 導入フロー |
| hr-evaluation | faq | よくある質問 |
| hr-evaluation | case_study | 導入事例 |
| NULL | profile | 庄山英俊プロフィール・資格・実績 |
| NULL | profile | 庄山FP事務所について |

---

### `knowledge_tags`（タグマスタ）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| name | String | UNIQUE。"離職率改善", "中小企業", "BtoB" など |

---

### `knowledge_item_tags`（ナレッジ×タグ 中間テーブル）

| カラム | 型 | 説明 |
|-------|----|------|
| knowledgeItemId | String | PK複合、FK → knowledge_items |
| tagId | String | PK複合、FK → knowledge_tags |

---

### `knowledge_versions`（ナレッジ変更履歴）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| knowledgeItemId | String | FK → knowledge_items |
| version | Int | バージョン番号 |
| content | String | 変更前の本文 |
| changedAt | DateTime | |
| changeNote | String? | 変更理由メモ |

---

## 顧客DB系

### `companies`（企業マスタ）
1企業1レコード。重複判定のキーとなるフィールドを持つ。

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| corporateNumber | String? | UNIQUE。法人番号（重複判定の最優先キー） |
| name | String | 会社名 |
| nameKana | String? | 会社名ひらがな |
| websiteUrl | String? | 会社サイト |
| inquiryPageUrl | String? | お問い合わせページ |
| representativeName | String? | 代表者名 |
| executiveInfo | String? | 役員情報 |
| employeeCount | Int? | 従業員数 |
| listingType | String? | 上場種別 |
| capitalAmount | BigInt? | 資本金 |
| revenue | BigInt? | 売上高 |
| fiscalMonth | Int? | 決算月 |
| officeCount | Int? | 事業所数 |
| factoryCount | Int? | 工場数 |
| storeCount | Int? | 店舗数 |
| foundedAt | DateTime? | 設立年月 |
| shortDescription | String? | 一言説明 |
| createdAt | DateTime | |
| updatedAt | DateTime | 自動更新 |

---

### `company_details`（企業詳細）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| companyId | String | UNIQUE、FK → companies |
| mainIndustryLarge | String? | メイン大業界 |
| mainIndustrySmall | String? | メイン小業界 |
| subIndustryLarge | String? | サブ大業界 |
| subIndustrySmall | String? | サブ小業界 |
| businessKeywords | String? | 事業内容キーワード（カンマ区切り） |
| businessFeatures | String? | BtoB/BtoC等（カンマ区切り） |
| companyOverview | String? | 会社概要（長文） |

---

### `offices`（事業所）
1企業に複数の事業所が紐づく。本社もここに含む。

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| companyId | String | FK → companies |
| officeName | String? | 事業所名 |
| officeNameKana | String? | 事業所名ひらがな |
| officeCategory1 | String? | 事業所分類1 |
| officeCategory2 | String? | 事業所分類2 |
| officeCategory3 | String? | 事業所分類3 |
| addressType | String? | 住所種別（本社/支社等） |
| postalCode | String? | 郵便番号 |
| prefecture | String? | 都道府県 |
| city | String? | 市区町村以降 |
| fullAddress | String? | 住所（フル） |
| registeredPostalCode | String? | 登記住所郵便番号 |
| registeredAddress | String? | 登記住所 |
| isHeadquarters | Boolean | 本社フラグ |

---

### `contacts`（連絡先）
メール・電話・FAX・フォームURLを格納。事業所または企業に直接紐づく。

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| companyId | String | FK → companies |
| officeId | String? | FK → offices（NULL = 企業直接紐づけ） |
| contactType | String | "email" / "phone" / "fax" / "form" |
| value | String | メールアドレス/電話番号/FAX/フォームURL |
| isPrimary | Boolean | 送信に使う主連絡先か |
| label | String? | "本社採用メール" 等の識別ラベル |

---

### `job_postings`（求人情報）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| companyId | String | FK → companies |
| jobTypes | String? | 求人募集職種 |
| latestPostedAt | DateTime? | 最新の求人登録日 |
| estimatedAnnualCost | BigInt? | 推定求人出稿額（年） |
| jobUrl | String? | 求人URL |

---

## インポート系

### `import_sources`（インポートソース定義）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| name | String | "MUSUBU" / "Urizo" / "custom" |
| displayName | String | 表示名 |
| description | String? | |
| createdAt | DateTime | |

---

### `import_sessions`（インポート実行履歴）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| sourceId | String | FK → import_sources |
| fileName | String | アップロードされたCSVファイル名 |
| totalRows | Int | 総行数 |
| importedRows | Int | インポート成功行数 |
| skippedRows | Int | スキップ行数 |
| duplicateRows | Int | 重複検出行数 |
| status | String | "completed" / "failed" / "partial" |
| importedAt | DateTime | |
| errorLog | String? | エラー内容 |

---

### `company_sources`（企業×ソース紐づけ）
1企業が複数ソースから来た場合の追跡用。元のCSVデータも保持。

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| companyId | String | FK → companies |
| importSessionId | String | FK → import_sessions |
| sourceRowData | String | 元のCSV行データをJSON文字列で保存 |
| createdAt | DateTime | |

---

## DM送信系

### `target_lists`（送信対象リスト）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| name | String | リスト名（例: "福岡_建設業_10名以上"） |
| description | String? | |
| filterSnapshot | String? | 作成時のフィルタ条件をJSON文字列で保存 |
| createdAt | DateTime | |
| updatedAt | DateTime | 自動更新 |

---

### `target_list_items`（リストの中身）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| listId | String | FK → target_lists |
| companyId | String | FK → companies |
| contactId | String? | 送信先として選んだ連絡先 |
| addedAt | DateTime | |
| salesStatus | String? | CRM拡張用: "lead" / "approached" / "negotiating" / "closed"（Phase 1はNULL） |
| memo | String? | CRM拡張用メモ（Phase 1はNULL） |

---

### `mail_generations`（AI生成メール）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| listItemId | String | FK → target_list_items |
| serviceId | String | FK → services（どのサービスのDMか） |
| subject | String | 件名 |
| body | String | 本文 |
| generatedAt | DateTime | |
| editedBody | String? | 手動編集後の本文 |
| isApproved | Boolean | 送信承認フラグ |

---

### `send_logs`（送信ログ）

| カラム | 型 | 説明 |
|-------|----|------|
| id | String | PK（cuid） |
| mailGenerationId | String | FK → mail_generations |
| sentAt | DateTime | |
| sentTo | String | 送信先メールアドレス |
| status | String | "sent" / "failed" / "bounced" |
| errorMessage | String? | |

---

## テーブル関係図

```
business_profiles（1レコード固定）

services ────────────────────────── knowledge_items ── knowledge_item_tags ── knowledge_tags
                                          │
knowledge_categories ─────────────────────┘
                                          │
                                    knowledge_versions

companies ──── company_details
    │      ──── offices ──── contacts ◄──────────────────────┐
    │      ──── job_postings                                  │
    │      ──── company_sources ── import_sessions ── import_sources
    │
    └──── target_list_items ◄── target_lists
              │    └── contacts（送信先）
              │
          mail_generations ── services
              │
          send_logs
```

## 重複判定ロジック

| 優先順位 | 判定方法 | 信頼度 |
|---------|---------|--------|
| 1位 | 法人番号が完全一致 | 高（確実） |
| 2位 | 会社名＋都道府県が一致 | 中 |
| 3位 | 電話番号が一致 | 低 |

重複候補はUIで提示し、ユーザーが「統合」または「別企業」を判断する。
