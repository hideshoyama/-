# 顧客DB＆DM営業メール送信Webアプリ

## プロジェクト概要

庄山FP事務所（庄山英俊）が運営する事業全体のナレッジ管理基盤と、
営業リスト収集ツール（MUSUBU/Urizo等）から取得した企業データを統合管理する顧客DBを構築し、
その上でAI生成した営業メールをDM送信できるWebアプリケーション。

将来的にはWebチャットボットとのナレッジ連携、CRM機能への拡張も視野に入れる。

## 技術スタック

- **フレームワーク**: Next.js 15（App Router）+ TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **DB**: SQLite（Prisma ORM）→ 将来PostgreSQL（Azure）に移行可能な設計
- **AI**: Azure OpenAI Service または Anthropic Claude API
- **メール送信**: SMTP（抽象化済み、将来SendGrid/Azure Communication Servicesに切替可）

## ディレクトリ構成

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
│   │   └── page.tsx                # ナレッジ管理
│   └── api/
│       ├── customers/              # 企業CRUD
│       ├── import/                 # CSVインポート
│       ├── lists/                  # 抽出リスト管理
│       ├── generate/               # AIメール生成
│       ├── send/                   # メール送信
│       └── knowledge/              # ナレッジCRUD
├── components/
│   ├── customers/                  # 企業関連UIコンポーネント
│   ├── import/                     # インポート関連
│   ├── mail/                       # メール関連
│   ├── knowledge/                  # ナレッジ関連
│   └── ui/                         # shadcn/ui共通
├── lib/
│   ├── db/
│   │   └── client.ts               # Prismaクライアント（シングルトン）
│   ├── importers/
│   │   ├── musubu.ts               # MUSUBUカラムマッピング
│   │   ├── urizo.ts                # Urizoカラムマッピング
│   │   └── custom.ts               # カスタムマッピング
│   ├── duplicate-detector.ts       # 重複検出ロジック
│   ├── ai.ts                       # AI API連携（メール生成）
│   └── mailer.ts                   # メール送信（抽象化）
└── types/
    ├── customer.ts                 # 企業関連型定義
    ├── import.ts                   # インポート関連型定義
    ├── mail.ts                     # メール関連型定義
    └── knowledge.ts                # ナレッジ関連型定義

prisma/
└── schema.prisma                   # Prismaスキーマ（全テーブル定義）

data/
├── sample-musubu.csv               # MUSUBUサンプルCSV
└── sample-urizo.csv                # UrizoサンプルCSV
```

## DBスキーマ（テーブル一覧）

### ナレッジ管理系
| テーブル | 概要 |
|---------|------|
| `business_profiles` | 庄山FP事務所の基本情報（1レコード固定） |
| `services` | 提供サービスマスタ（人事評価制度支援、FP相談等） |
| `knowledge_categories` | ナレッジのカテゴリ（概要/メリット/料金/事例/FAQ等） |
| `knowledge_items` | ナレッジ本体（Markdown形式、AIメール・チャットボット共用） |
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

## 作業ルール

1. ファイルの作成・変更・削除の前に必ず計画を提示し、明示的な承認を得てから実行すること
2. Git操作も同様に事前確認すること
3. 追加機能や設計変更を勝手に行わないこと
4. CSVはBOM付きUTF-8（utf-8-sig）で保存すること
5. 独自の設計判断やレイアウト判断をしないこと
6. 不明点・矛盾を感じたら必ず質問して待つこと

## 開発フェーズ

### Phase 1: 顧客データベース（現在）
- CSVインポート（MUSUBU/Urizo両対応）
- 企業一覧・フィルタリング画面
- 企業詳細画面
- 送信対象リスト管理

### Phase 2: 営業メール生成（AI）
- ナレッジ管理UI
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
