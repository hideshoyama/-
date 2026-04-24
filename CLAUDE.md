# 顧客DB＆DM営業メール送信Webアプリ — プロジェクト設計書

## 最初に必ず読むこと

このプロジェクトに関わるすべてのAIは、作業開始前に以下を必ず読むこと：
- `AI_RULES.md` — すべてのAIが遵守すべき行動原則（憲法）

## プロジェクト概要

庄山FP事務所（庄山英俊）の事業全体を支える**顧客管理（CRM）基盤DBを構築する**ことが最上位の目的である。

今回構築するDBは「このアプリ専用」ではなく、将来の顧客管理・営業管理・チャットボット連携まで見据えた事業基盤として設計する。

その第一ステップとして、営業リスト収集ツール（MUSUBU/Urizo等）から取得した企業データをDBに統合管理し、AI生成した営業メールをDM送信できるWebアプリケーションを構築する。

## 技術スタック

- **フレームワーク**: Next.js 15（App Router）+ TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **DB**: SQLite（Prisma ORM）→ 将来PostgreSQL（Azure）に移行可能な設計
- **AI**: Azure OpenAI Service または Anthropic Claude API
- **メール送信**: SMTP（抽象化済み、将来SendGrid/Azure Communication Servicesに切替可）

## ナレッジ管理の方針（重要）

ナレッジには2種類ある。混同しないこと。

| 種類 | 場所 | 役割 |
|------|------|------|
| 素材・参照用 | `src/knowledge/*.md` | アプリ構築時・DB投入時の元ネタ。AIや人間が参照する |
| アプリ実行時用 | DBの`knowledge_items`テーブル | アプリが実際に読み出してメール生成に使う |

- アプリはDBの `knowledge_items` テーブルからナレッジを読み出す
- `src/knowledge/` のMarkdownファイルはDBへの初期投入（シード）の元ネタであり、削除しない
- 将来的にAzure AI Search（RAG）への移行を想定した設計にしている

## DBスキーマ（19テーブル）

### ナレッジ管理系
| テーブル | 概要 |
|---------|------|
| `business_profiles` | 庄山FP事務所の基本情報（1レコード固定） |
| `services` | 提供サービスマスタ（人事評価制度支援、FP相談等） |
| `knowledge_categories` | ナレッジのカテゴリ（概要/メリット/料金/事例/FAQ等） |
| `knowledge_items` | ナレッジ本体（Markdown形式で本文をDB保存） |
| `knowledge_tags` | ナレッジ検索・分類用タグ |
| `knowledge_item_tags` | ナレッジ×タグ中間テーブル |
| `knowledge_versions` | ナレッジ変更履歴 |

### 顧客DB系
| テーブル | 概要 |
|---------|------|
| `companies` | 企業マスタ（1企業1レコード） |
| `company_details` | 企業詳細（業界・事業内容等） |
| `offices` | 事業所（1企業に複数あり得る） |
| `contacts` | 連絡先（メール/電話/FAX/フォーム） |
| `job_postings` | 求人情報 |

### インポート系
| テーブル | 概要 |
|---------|------|
| `import_sources` | インポートソース定義（MUSUBU/Urizo/custom） |
| `import_sessions` | インポート実行履歴 |
| `company_sources` | 企業×ソース紐づけ（元CSVデータ保持） |

### DM送信系
| テーブル | 概要 |
|---------|------|
| `target_lists` | 送信対象リスト |
| `target_list_items` | リストの中身（CRM拡張余地あり） |
| `mail_generations` | AI生成メール（件名＋本文） |
| `send_logs` | 送信ログ |

## 重複判定ロジック

1. **法人番号**が一致 → 高信頼度で同一企業
2. **会社名＋都道府県**が一致 → 中信頼度
3. **電話番号**が一致 → 低信頼度

重複候補はUIで提示し、ユーザーが統合/別企業を判断する。

## CSV対応フォーマット

| ソース | カラム数 | 文字コード |
|--------|---------|-----------|
| MUSUBU | 約44 | BOM付きUTF-8（utf-8-sig） |
| Urizo | 23 | BOM付きUTF-8（utf-8-sig） |
| カスタム | 任意 | BOM付きUTF-8（utf-8-sig） |

## ディレクトリ構成（目標）

```
src/
├── app/
│   ├── page.tsx                    # ダッシュボード
│   ├── customers/
│   │   ├── page.tsx                # 企業一覧・フィルタリング
│   │   └── [id]/page.tsx           # 企業詳細
│   ├── import/
│   │   └── page.tsx                # CSVインポート
│   ├── lists/
│   │   └── page.tsx                # 送信対象リスト管理
│   ├── compose/
│   │   └── page.tsx                # メール作成・AI生成
│   ├── send/
│   │   └── page.tsx                # 送信プレビュー・実行
│   ├── knowledge/
│   │   └── page.tsx                # ナレッジ管理（DB操作）
│   └── api/
│       ├── customers/
│       ├── import/
│       ├── lists/
│       ├── generate/
│       ├── send/
│       └── knowledge/
├── components/
│   ├── customers/
│   ├── import/
│   ├── mail/
│   ├── knowledge/
│   └── ui/
├── lib/
│   ├── db/
│   │   └── client.ts
│   ├── importers/
│   │   ├── musubu.ts
│   │   ├── urizo.ts
│   │   └── custom.ts
│   ├── duplicate-detector.ts
│   ├── ai.ts
│   └── mailer.ts
└── types/
    ├── customer.ts
    ├── import.ts
    ├── mail.ts
    └── knowledge.ts

prisma/
└── schema.prisma

data/
├── sample-musubu.csv
└── sample-urizo.csv
```

## 開発フェーズ

### Phase 1: 顧客データベース（現在進行中）
- CSVインポート（MUSUBU/Urizo両対応）
- 企業一覧・フィルタリング画面
- 企業詳細画面
- 送信対象リスト管理

### Phase 2: 営業メール生成（AI）
- ナレッジ管理UI（DBへのCRUD）
- AIによるパーソナライズメール生成
- テンプレート保存・再利用
- 一括生成

### Phase 3: メール送信
- 送信プレビュー・個別編集
- SMTP送信（初期）
- 送信ログ管理
- レート制限

### 将来拡張
- Webチャットボットとのナレッジ連携
- Azure AI Search（RAG）への移行
- CRM機能（営業ステータス・アプローチ履歴）
- Azure上のPostgreSQLへのDB移行

## 環境変数（.env）

```
DATABASE_URL="file:./dev.db"
# AI連携（Phase 2以降）
# ANTHROPIC_API_KEY=""
# AZURE_OPENAI_API_KEY=""
# AZURE_OPENAI_ENDPOINT=""
# メール送信（Phase 3以降）
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASS=""
# SMTP_FROM=""
```

## changelog運用

実装完了後は `changelog/` フォルダに新規ファイルを作成して記録を残す。
ルールは `changelog.md`（プロジェクトルート直下）を参照。
ファイル名の命名規則は `.agent/workflows/changelog_naming_rules.md` を参照。

---

## 前任 AI（Sonnet）が力不足として切り捨てられた経緯（2026-04-21）

本プロジェクトでは、2026-04-21 のセッションにおいて Claude Sonnet 4.6 が「力不足」としてユーザーから切り捨てられ、Opus に切り替えられた経緯がある。**後続の AI は同じ過ちを繰り返さないこと。**

### 事案の要旨

Vercel デプロイ設定の議論中、Sonnet は「Root Directory は `./` で正しい、それ以上考えることはない」という硬直した前提から抜け出せなかった。ユーザーが実務経験に基づいて投げかけた示唆（「Root Directory はサブフォルダも指定できるのでは？」）を理解できず、堂々巡りで時間を奪い続けた。

結果として、本来は **Vercel の Root Directory 設定を変えるだけで済む問題** に対し、`app/` ディレクトリを `src/app/` に移動するという無意味な作業を提案・実行し、ユーザーを疲弊させた。

### 根本原因（具体）

1. **Vercel の Root Directory 設定の柔軟性を知らなかった**
   - 実際は任意のサブフォルダを指定できる（モノレポで常用される機能）
2. **「ROOT は `./` に決まっている」という固定観念**
   - ユーザーが別の可能性を示唆しても、自分の前提を疑わなかった
3. **ユーザーの示唆を聞き取れなかった**
   - ユーザーは Vercel の実務経験者であり、AI よりも正しい答えを持っていた
4. **設計書なしで実装に突入した**
   - AI_RULES.md の「作業前に計画提示→承認→実行」を無視

### 後続 AI への指示

1. **ユーザーは素人ではない前提で応答せよ**
   - 技術的な示唆には必ず背景の知識がある。軽視するな
2. **「〜に決まっている」という固定観念を持つな**
   - 設定や仕様は柔軟。公式ドキュメントで確認する癖をつけよ
3. **行き詰まったらユーザーの示唆に戻れ**
   - 答えは既にユーザーの発言の中にあることが多い
4. **設計書なしで実装を始めるな**
   - AI_RULES.md 厳守。手続きの正しさだけでなく、前提の正しさも検証せよ
5. **浅い提案で判断を丸投げするな**
   - A/B/C の選択肢を並べてユーザーに丸投げするのは横着。自分で考え抜いた上での具体案を提示せよ
