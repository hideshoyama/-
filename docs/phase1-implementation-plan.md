# Phase 1 実装設計書

## 前提条件

- **ローカルデプロイなし**：このPCではdev serverを起動しない。テスト・確認はすべてVercelデプロイ後に行う。
- **このアプリの位置づけ**：事業全体のCRM基盤の中の「営業DM送信」に特化したツール。早期に営業メールを送れる状態を作ることが最優先。
- **CSVインポートは暫定対応**：現在はMUSUBU・Urizo限定。将来はAI中心の汎用データ取込設計（別プロジェクト）に移行する。

## プロジェクト全体構成（将来像）

| プロジェクト | 目的 | 状態 |
|------------|------|------|
| **customer-dm-app**（これ） | 営業DM送信に特化 | 進行中 |
| crm-db-builder（別リポジトリ） | CRM基盤DB・AI汎用データ取込 | 将来 |
| crm-app（別リポジトリ） | 本格CRM（営業管理・顧客管理） | 将来 |
| knowledge-base（別リポジトリ） | ナレッジDB・チャットボット連携 | 将来 |

全プロジェクトがAzure PostgreSQL（shoyama-crm-db）を共有する。

---

## このアプリで作るもの（Phase 1）

### 実装済み（触らない）

| ファイル | 内容 |
|---------|------|
| `prisma/schema.prisma` | 19テーブル定義（PostgreSQL対応済み） |
| `src/lib/db/client.ts` | Prismaクライアント |
| `src/lib/importers/musubu.ts` | MUSUBUのCSV→DBマッピング |
| `src/lib/importers/urizo.ts` | UrizoのCSV→DBマッピング |
| `src/lib/duplicate-detector.ts` | 重複判定ロジック |
| `src/types/import.ts` | インポート関連の型定義 |

### 今回実装するもの

**Step 1: 共通レイアウト・ダッシュボード**

| ファイル | 役割 |
|---------|------|
| `app/layout.tsx` | サイドバー付きレイアウト |
| `app/page.tsx` | ダッシュボード（統計・ナビゲーション） |

**Step 2: CSVインポート（暫定）**

| ファイル | 役割 |
|---------|------|
| `app/import/page.tsx` | インポート画面 |
| `app/api/import/route.ts` | インポートAPI |
| `src/lib/importers/engine.ts` | インポートエンジン |

対応ソース：MUSUBU・Urizo（暫定。将来AI汎用取込に置き換え）

処理フロー：
```
CSVファイル受信 → BOM除去・パース → マッピング
→ 重複チェック → DB保存 → 結果返却
```

**Step 3: 企業一覧・フィルタリング**

| ファイル | 役割 |
|---------|------|
| `app/customers/page.tsx` | 企業一覧画面 |
| `app/api/customers/route.ts` | 企業一覧API |

フィルタ項目：都道府県・業界・従業員数・メールアドレス有無

**Step 4: 企業詳細**

| ファイル | 役割 |
|---------|------|
| `app/customers/[id]/page.tsx` | 企業詳細画面 |
| `app/api/customers/[id]/route.ts` | 企業詳細API |

**Step 5: 送信対象リスト管理**

| ファイル | 役割 |
|---------|------|
| `app/lists/page.tsx` | リスト一覧 |
| `app/lists/[id]/page.tsx` | リスト詳細・編集 |
| `app/api/lists/route.ts` | リストCRUD API |
| `app/api/lists/[id]/route.ts` | リスト詳細API |

---

## ナビゲーション構成

```
ダッシュボード
企業データベース
  └ 企業一覧
  └ CSVインポート
送信対象リスト
```

---

## 追加パッケージ

| パッケージ | 用途 |
|-----------|------|
| `papaparse` | CSVパース |
| `@types/papaparse` | 型定義 |

---

## デプロイ・テスト方針

1. GitHubにpush
2. Vercelが自動デプロイ
3. Vercel上で動作確認
4. 問題があればコード修正 → push → 再デプロイ

ローカルでのdev server起動・テストは行わない。
