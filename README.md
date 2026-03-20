# HYPHEN Project Starter v3.20

> **Version**: v3.20（2026-03-20）
> **Anthropic公式ドキュメント準拠** — Claude Code agents/skills/rules/hooks

HYPHEN CO., LTD. のクライアントプロジェクト用スターターキット。
git clone してすぐに開発開始できる Next.js 16 + Claude Code 環境。

## クイックスタート

### 1. テンプレートからリポジトリ作成
```bash
gh repo create HYPHEN1003/[project-name] --template HYPHEN1003/hyphen-project-starter --private
gh repo clone HYPHEN1003/[project-name]
cd [project-name]
```

### 2. セットアップ
```bash
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

### 3. 壁打ちでCLAUDE.mdをカスタマイズ
```bash
claude
# → 「docs/new-project-guide.md に従って壁打ちを進めてください」
```

壁打ちガイド（`docs/new-project-guide.md`）に沿って13の質問に答えるだけで、プロジェクト固有のCLAUDE.mdが完成します。

## ディレクトリ構成

```
├── CLAUDE.md                  ← プロジェクト設定（<important if> パターン対応）
├── .claude/
│   ├── agents/                ← 6エージェント（公式フロントマター形式）
│   ├── skills/                ← 17スキル（トリガー条件付き）
│   ├── rules/                 ← パス固有ルール（api/db/ui）
│   ├── hooks/                 ← ガードレール（MCOレビューリマインド）
│   └── settings.json          ← 権限設定（$schema付き、セキュリティ重視）
├── src/                       ← Next.js 16 アプリケーション
│   ├── app/                   ← App Router ページ
│   ├── lib/                   ← ユーティリティ・Supabase クライアント
│   ├── types/                 ← 型定義
│   ├── __tests__/             ← ユニットテスト（Vitest）
│   └── e2e/                   ← E2Eテスト（Playwright）
├── docs/
│   ├── templates/             ← 仕様書テンプレート（project/feature）
│   ├── specs/                 ← 生成された仕様書
│   ├── reviews/               ← MCOレビュー結果
│   └── new-project-guide.md   ← テンプレート活用ガイド
├── prompts/                   ← AIプロンプト設計テンプレート
├── design/                    ← デザイン関連リンク
└── tasks/                     ← タスク管理・教訓記録
```

## 含まれるもの

| カテゴリ | 内容 |
|---------|------|
| **Agents（6個）** | designer / ux-writer / prompt-engineer / code-reviewer / qa-tester / db-architect |
| **Skills（17個）** | 仕様書壁打ち(2) + PRレビュー(1) + デザイン系(14) |
| **Rules（3個）** | api-rules / db-rules / ui-rules（パス固有で自動注入） |
| **Hooks** | MCOレビューリマインド（PR作成時） |
| **Templates** | プロジェクト仕様書 / 機能仕様書 |
| **Tests** | Vitest（ユニット）+ Playwright（E2E）設定済み |
| **CI/CD** | GitHub Actions（lint → test → build → Lighthouse） |

## スキル一覧

### 開発ワークフロー
| コマンド | 説明 |
|---------|------|
| `/spec-project` | 壁打ちでプロジェクト全体の仕様書を作成 |
| `/spec-feature` | 壁打ちで機能単位の仕様書を作成 |
| `/pre-pr-review` | MCO 3AIレビュー（PR作成前） |

### デザイン・実装
| コマンド | 説明 |
|---------|------|
| `/design-to-code` | テキスト/スクショからコード変換 |
| `/figma-to-code` | FigmaデザインからFigma MCP経由でコード変換 |
| `/create-lp-section` | LPセクション実装 |
| `/design-system-architect` | デザインシステム構築 |
| `/design-critique` | デザインレビュー |
| `/accessibility-auditor` | WCAG 2.2 AA監査 |

## 開発コマンド

```bash
cd src
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run lint         # Lint
npm run test:run     # ユニットテスト
npm run test:e2e     # E2Eテスト
```

## バージョン履歴

| Version | Date | Changes |
|---------|------|---------|
| v3.20 | 2026-03-20 | Anthropic公式準拠、仕様書テンプレート、MCOレビュー習慣化 |
| v2.0 | - | Next.js + テスト + CI/CD + ドキュメント整備 |
| v1.0 | - | 初期テンプレート（Supabase中心版） |
