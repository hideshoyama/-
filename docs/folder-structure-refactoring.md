# フォルダ構成リファクタリング設計書

## 背景

前回のセッションで、設計書を作成する前に実装に着手してしまい、
結果として `app/` フォルダをリポジトリルートに作ってしまった。
CLAUDE.md の設計書では `src/app/` が正しい配置である。

AI_RULES.md の「作業前に計画を提示し、承認を得てから実行すること」を
守らなかったことが根本原因。本ドキュメントはその是正のための設計書。

## 現状（誤った構造）

```
customer-dm-app/
├── app/                    ← ルートにある（誤）
│   ├── layout.tsx
│   ├── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── api/
│   │   └── import/route.ts
│   └── import/page.tsx
├── src/
│   ├── generated/prisma/   ← Prisma 7のクライアント生成先
│   ├── lib/
│   │   ├── db/client.ts
│   │   ├── importers/
│   │   │   ├── musubu.ts
│   │   │   ├── urizo.ts
│   │   │   └── custom.ts
│   │   └── duplicate-detector.ts
│   └── types/
│       └── import.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
├── prisma.config.ts
└── .env
```

## 目標（CLAUDE.md準拠の構造）

```
customer-dm-app/
├── src/
│   ├── app/                ← ここに移動
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── api/
│   │   │   └── import/route.ts
│   │   └── import/page.tsx
│   ├── generated/prisma/
│   ├── lib/
│   │   ├── db/client.ts
│   │   ├── importers/
│   │   └── duplicate-detector.ts
│   └── types/
├── prisma/
├── public/
└── （設定ファイル類）
```

## 移行手順

### 1. ファイル移動

- ルートの `app/` 配下すべてを `src/app/` に移動
- 対象ファイル：
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/favicon.ico`
  - `app/globals.css`
  - `app/api/import/route.ts`
  - `app/import/page.tsx`
- ルートの `app/` フォルダを削除

### 2. 設定ファイルの確認

| ファイル | 変更要否 | 理由 |
|---------|---------|------|
| `tsconfig.json` | 変更不要 | `@/*` → `./src/*` は既に正しい |
| `next.config.ts` | 変更不要 | Next.jsは `src/app/` を自動認識 |
| `prisma.config.ts` | 変更不要 | Prisma設定は無関係 |
| `package.json` | 変更不要 | スクリプトは変更なし |

### 3. importパスの確認

`@/lib/db/client` などのimportは全て `src/lib/` を指しているため、
`app/` が `src/app/` に移動しても影響なし。

### 4. .gitignore の整理

`/app/generated/prisma` という行があるが、Prismaクライアントの出力先は
`src/generated/prisma` に変更済みのため、この行は不要。

**判断：削除する**（`src/generated/prisma` は gitignore しない＝コミット対象）

### 5. 動作確認

- ローカルで `npx next build` を実行し、ビルド成功を確認
- dev server は起動しない（ローカルdev禁止の方針に従う）

## 移行後の影響範囲

- importパスの変更：なし
- 設定ファイルの変更：`.gitignore` のみ
- ビルド出力の変更：Next.jsが `src/app/` を使うようになる
- Vercelデプロイの挙動：変わらず（プロジェクトルートは `/` のまま）

## この設計書の承認後に実行する作業

1. 本設計書の承認
2. ファイル移動コマンドの実行
3. `.gitignore` の修正
4. ローカルビルド確認
5. Git commit & push
6. Vercelデプロイの自動実行確認
