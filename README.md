# HYPHEN Project Starter v4.0

> **Version**: v4.0（2026-04-01）
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
│   ├── agents/                ← 18エージェント（公式フロントマター形式）
│   ├── skills/                ← 26スキル（トリガー条件付き）
│   ├── rules/                 ← 6ルール（api/db/ui/ai/security/integration）
│   ├── hooks/                 ← 4フック（ガードレール + キー漏洩検出 + RLSチェック）
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
| **Agents（18個）** | 既存8 + database-reviewer / build-error-resolver / typescript-reviewer / performance-optimizer / refactor-cleaner / e2e-runner / harness-optimizer / loop-operator / doc-updater / chief-of-staff |
| **Skills（26個）** | 既存21 + bedrock-setup / supabase-security-audit / data-migration-guard / mlops-pipeline / supabase-bulk-users / domain-setup |
| **Rules（6個）** | api / db / ui / ai / security / integration（パス固有で自動注入） |
| **Hooks（4個）** | 危険コマンドブロック / MCOリマインド / Stripeキー漏洩検出 / RLSチェック |
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
| v4.0 | 2026-04-01 | ECC由来エージェント10個、Obsidianスキル6個、AI/Security/Integrationルール、フック強化、Bedrock/LlamaCloud(optional)対応 |
| v3.20 | 2026-03-20 | Anthropic公式準拠、仕様書テンプレート、MCOレビュー習慣化 |
| v2.0 | - | Next.js + テスト + CI/CD + ドキュメント整備 |
| v1.0 | - | 初期テンプレート（Supabase中心版） |
