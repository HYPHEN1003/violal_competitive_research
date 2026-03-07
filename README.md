# HYPHEN Project Template

HYPHEN CO., LTD. のクライアントプロジェクト用テンプレートリポジトリ。
git clone してすぐに開発開始できる Next.js + Claude Code 環境。

## クイックスタート

### 1. テンプレートからリポジトリ作成
GitHub で「Use this template」→ Repository name にプロジェクト名 → Private → Create

### 2. セットアップ
```bash
git clone https://github.com/HYPHEN1003/[プロジェクト名].git
cd [プロジェクト名]

# Node.js バージョン合わせ
nvm use

# 依存関係インストール
cd src
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集

# 開発サーバー起動
npm run dev
```

### 3. CLAUDE.md をカスタマイズ
`[PLACEHOLDER]` をすべてプロジェクト固有の情報に置き換える。

### 4. Claude Code で作業開始
```bash
claude
```

## ディレクトリ構成

```
├── CLAUDE.md              ← プロジェクト設定（Claude Codeが自動読み込み）
├── .nvmrc                 ← Node.js バージョン指定
├── src/                   ← Next.js アプリケーション
│   ├── app/               ← App Router ページ
│   ├── lib/               ← ユーティリティ・Supabase クライアント
│   ├── types/             ← 型定義
│   ├── __tests__/         ← ユニットテスト（Vitest）
│   ├── e2e/               ← E2Eテスト（Playwright）
│   └── .env.example       ← 環境変数テンプレート
├── .claude/
│   ├── skills/            ← スキル定義（/コマンド で呼び出し）
│   └── agents/            ← エージェント定義（専門家の人格）
├── .github/workflows/     ← CI/CD（lint, test, build, Lighthouse）
├── docs/                  ← 設計書・提案資料・チェックリスト
├── prompts/               ← AIプロンプト設計テンプレート
├── design/                ← デザイン関連リンク
└── tasks/                 ← タスク管理・教訓記録
```

## 含まれるもの

| カテゴリ | 内容 |
|---------|------|
| **src/** | Next.js 15 + Tailwind + shadcn/ui の最小構成（ビルド可能） |
| **テスト** | Vitest（ユニット）+ Playwright（E2E）設定済み |
| **CI/CD** | GitHub Actions（lint → test → build → Lighthouse） |
| **Skills（14個）** | コア5個 + オプション9個（詳細: `.claude/skills/README.md`） |
| **Agents（6個）** | designer / ux-writer / prompt-engineer / code-reviewer / qa-tester / db-architect |
| **docs/** | 技術スタック / 提案書 / セキュリティチェックリスト / 環境構成 / エージェント活用ガイド |

## 開発コマンド

```bash
cd src
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run lint         # Lint
npm run test:run     # ユニットテスト
npm run test:e2e     # E2Eテスト
```

## カスタマイズのポイント

- **技術スタック**: CLAUDE.md の「技術スタック」と「自作禁止リスト」を案件に合わせて調整
- **デザイントークン**: CLAUDE.md の「デザイン方針」をクライアントのブランドに合わせる
- **Skills**: `.claude/skills/` に案件固有のスキルを追加
- **Agents**: `.claude/agents/` の各エージェントをプロジェクトに最適化
