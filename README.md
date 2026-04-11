# HYPHEN Project Starter v4.2

> **Version**: v4.2（2026-04-07）
> **Anthropic公式ドキュメント準拠** — Claude Code agents/skills/rules/hooks

HYPHEN CO., LTD. のクライアントプロジェクト用スターターキット。
git clone してすぐに開発開始できる Next.js 16 + Claude Code 環境。

## 前提条件

- Node.js 20+
- npm 10+
- jq（フックのJSON解析に必要: `brew install jq`）
- Claude Code CLI

## 研究駆動開発（Research-Driven Development）

このテンプレートは「一度作って終わり」ではありません。
世界中のOSSを日常的に調査・検証し、使えると判断したものを継続的に取り込んでいます。

```
情報収集（Twitter / GitHub / 技術コミュニティ）
    ↓  必ず自分でGitHubを開いて試す
検証（クローン → 実行 → 評価）
    ↓  使える/使えないを判断
ナレッジ化（セカンドブレインに蓄積）
    ↓  パターンをテンプレートに反映
テンプレート更新（hyphen-project-starter）
    ↓  クライアント案件で実戦投入
フィードバック → 次の調査サイクルへ
```

調査記録は `docs/templates/tech-research-log.md` テンプレートで管理しています。

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
│   ├── agents/                ← 19エージェント（公式フロントマター形式）
│   ├── skills/                ← 36スキル（トリガー条件付き）
│   ├── rules/                 ← 6ルール（api/db/ui/ai/security/integration）
│   ├── hooks/                 ← 8フック（セキュリティ + 品質 + ログ）
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
│   ├── dev-environment.md     ← 推奨開発環境（Ghostty + SAND + worktrees）
│   └── new-project-guide.md   ← テンプレート活用ガイド
├── recipes/                   ← オプション機能（案件ごとにオプトイン）
│   ├── document-ingest/       ← markitdown + opendataloader-pdf
│   ├── document-rag/          ← PageIndex (vectorless RAG)
│   └── voice-asr/             ← VibeVoice ASR (optional, GPU)
├── prompts/                   ← AIプロンプト設計テンプレート
├── design/                    ← デザイン関連リンク
└── tasks/                     ← タスク管理・教訓記録
```

## 含まれるもの

| カテゴリ | 数量 | 内容 |
|---------|------|------|
| **Agents** | 19個 | code-reviewer, db-architect, designer, ux-writer, qa-tester, prompt-engineer, typescript-reviewer, performance-optimizer, build-error-resolver, e2e-runner, refactor-cleaner, database-reviewer, harness-optimizer, loop-operator, doc-updater, chief-of-staff, image-advisor, youtube-researcher, aidesigner-frontend |
| **Skills** | 39個 | 下記「スキル一覧」参照 |
| **Rules** | 6個 | api / db / ui / ai / security / integration（パス固有で自動注入） |
| **Hooks** | 8個 | 下記「フック一覧」参照 |
| **Templates** | 7個 | プロジェクト仕様書 / 機能仕様書 / HANDOFF / 営業企画書 / 提案サマリー / 提案補足 / 技術調査ログ |
| **Tests** | 設定済み | Vitest（ユニット）+ Playwright（E2E） |
| **CI/CD** | 設定済み | GitHub Actions（lint → 型チェック → test → E2E → security audit → build → Lighthouse） |

## スキル一覧（39個）

### コア開発（6個）
| コマンド | 説明 |
|---------|------|
| `/spec-project` | 壁打ちでプロジェクト全体の仕様書を作成 |
| `/spec-feature` | 壁打ちで機能単位の仕様書を作成 |
| `/pre-pr-review` | MCO 3AIレビュー（PR作成前） |
| `/tdd` | RED-GREEN-REFACTORループによるテスト駆動開発 |
| `/verification-loop` | 6フェーズ品質検証（ビルド・型・Lint・テスト・セキュリティ・diff） |
| `/eval-harness` | Eval-Driven Development（pass@k / pass^k メトリクス） |

### デザイン・UI（11個）
| コマンド | 説明 |
|---------|------|
| `/design-to-code` | テキスト/スクショからコード変換 |
| `/figma-to-code` | FigmaデザインからFigma MCP経由でコード変換 |
| `/create-lp-section` | LPセクション（Hero/About/FAQ等）実装 |
| `/design-system-architect` | デザイントークン・コンポーネント体系構築 |
| `/design-critique` | デザインレビュー・改善提案 |
| `/accessibility-auditor` | WCAG 2.2 AA準拠チェック |
| `/brand-identity-creator` | ブランドアイデンティティ構築 |
| `/figma-auto-layout` | Figma Auto Layout仕様の変換 |
| `/design-trend-synthesizer` | デザイントレンド分析 |
| `/ui-ux-pattern-master` | 画面設計・UIパターン設計 |
| `/aidesigner` | AI Designer MCP連携UIデザイン生成（要セットアップ） |

### 営業・提案（4個）
| コマンド | 説明 |
|---------|------|
| `/create-proposal-slide` | クライアント向け提案スライドを作成 |
| `/create-service-proposal` | HYPHEN AIサービスの汎用営業企画書を生成 |
| `/sales-proposal-pipeline` | 5ステージ営業提案パイプライン（※1） |
| `/marketing-asset-factory` | マーケティングアセット一括作成 |

### リサーチ・分析（6個）
| コマンド | 説明 |
|---------|------|
| `/hypothesis-driven-analysis` | 仮説駆動分析（新規事業・戦略判断） |
| `/market-research-pipeline` | AI市場リサーチ5ステップ |
| `/research-google-trends` | Google Trends キーワード分析 |
| `/research-hackernews` | HackerNews トップ記事分析 |
| `/research-grok-x` | Grok API × X リアルタイム検索 |
| `/grill-me` | プラン・設計の容赦ないストレステスト |

### インフラ・セキュリティ（6個）
| コマンド | 説明 |
|---------|------|
| `/supabase-security-audit` | Supabase RLS・セキュリティ一括監査 |
| `/supabase-bulk-users` | Supabase Auth一括ユーザー作成 |
| `/domain-setup` | Cloudflare + Vercel ドメイン設定 |
| `/bedrock-setup` | Amazon Bedrock移行チェックリスト |
| `/data-migration-guard` | JSON→DB移行チェック |
| `/mlops-pipeline` | ML自動再学習パイプライン設計 |

### コンテンツ・品質（5個）
| コマンド | 説明 |
|---------|------|
| `/review-prompt` | AIプロンプト品質レビュー |
| `/avoid-ai-writing` | AI文章の「AIっぽさ」検出・リライト（英語専用） |
| `/create-flex-message` | LINE Flex Message生成 |
| `/ubiquitous-language` | DDD式ユビキタス言語抽出 |
| `/meeting-prep-briefing` | 商談準備ブリーフィング自動生成 |
| `/avoid-ai-writing-ja` | AI文章の「AIっぽさ」検出・リライト（日本語専用） |

> **※1**: `sales-proposal-pipeline` は `mkt-sales-playbook` と `mkt-content-ops` に依存。
> これらは [hyphen-marketing-skills](https://github.com/HYPHEN1003/hyphen-marketing-skills) からインストール:
> `bash ~/Documents/dev/hyphen-marketing-skills/install.sh`

## フック一覧（8個）

| フック | 実行時期 | 役割 |
|--------|---------|------|
| `guard-dangerous-commands.sh` | PreToolUse (Bash) | 破壊的コマンドブロック（二重防御） |
| `detect-secret-leak.sh` | PreToolUse (Bash/Write/Edit) | Stripe/Anthropic/OpenAI/AWS/GitHub/Google/Slack/Vercelキー漏洩検出 |
| `check-rls-on-migration.sh` | PreToolUse (Write/Edit) | RLSポリシー検証 |
| `require-tests-for-pr.sh` | PreToolUse (Bash) | PR作成前のテスト要件チェック |
| `remind-mco-review.sh` | PreToolUse (Bash) | MCOレビュー確認リマインド |
| `log-commands.sh` | PreToolUse (Bash) | コマンド実行ログ記録 |
| `auto-format.sh` | PostToolUse (Write/Edit) | Prettier自動フォーマット |
| `auto-lint.sh` | PostToolUse (Write/Edit) | ESLint自動修正 |

全フックは `_parse-input.sh` 共通パーサーを使用。jq 必須（フェイルクローズ: 未インストール時はブロック）。

## 開発コマンド

```bash
cd src
npm run dev          # 開発サーバー
npm run build        # ビルド
npm run lint         # Lint
npm run test:run     # ユニットテスト
npm run test:e2e     # E2Eテスト
```

## マーケティングスキル（別リポジトリ）

マーケティング・営業Ops系スキル（15個）は [hyphen-marketing-skills](https://github.com/HYPHEN1003/hyphen-marketing-skills) に分離しています。
`~/.claude/skills/` にグローバルインストールすれば、どのプロジェクトからでも使用可能。

## Recipes（オプション機能）

案件ごとにオプトインで有効化する重い機能は [`recipes/`](./recipes/) に分離されています。

| Recipe | 用途 | 依存 | 案件例 |
|--------|------|------|--------|
| [document-ingest](./recipes/document-ingest/) | ファイル→Markdown/構造化データ変換 | markitdown + opendataloader-pdf | クライアント資料、契約書、マニュアル |
| [document-rag](./recipes/document-rag/) | 長文書のvectorless推論検索 | PageIndex | 保険約款、技工指示書、作業マニュアル |
| [voice-asr](./recipes/voice-asr/) | 60分単発の音声認識（多言語） | VibeVoice ASR (GPU) | 商談録音、取材音声、ポッドキャスト |

**設計思想**: core を薄く保ち、重い依存（Java / Python / GPU / MCP権限）は recipe に逃がす。詳細は [recipes/README.md](./recipes/README.md) 参照。

## 開発環境

推奨セットアップ（Ghostty + SANDキーバインド + lazygit + yazi + Git worktrees）は [docs/dev-environment.md](./docs/dev-environment.md) 参照。

マルチClaude Code並列運用や、AIスケール出力に耐える安定ターミナル環境のセットアップ方法を記載。

## バージョン履歴

| Version | Date | Changes |
|---------|------|---------|
| v4.3 | 2026-04-11 | DESIGN.md（Google Stitch 9セクション）、recipes/ 導入（document-ingest / document-rag / voice-asr）、docs/dev-environment.md、ecc由来スキル 2個（verification-loop / eval-harness、スキル数 37→39） |
| v4.2 | 2026-04-07 | mkt-*分離(-1.2MB)、jqフェイルクローズ化、キー検出13種(+Anthropic/Google/Vercel)、認証フロー+ダッシュボード雛形、shadcn/ui 5コンポーネント、CI強化(E2E+型チェック+security audit)、Dependabot、next.config.ts移行 |
| v4.1 | 2026-04-03 | 営業企画書テンプレート・スキル追加、技術調査ログテンプレート、研究駆動開発セクション |
| v4.0 | 2026-04-01 | ECC由来エージェント10個、Obsidianスキル6個、AI/Security/Integrationルール、フック強化、Bedrock/LlamaCloud(optional)対応 |
| v3.20 | 2026-03-20 | Anthropic公式準拠、仕様書テンプレート、MCOレビュー習慣化 |
| v2.0 | - | Next.js + テスト + CI/CD + ドキュメント整備 |
| v1.0 | - | 初期テンプレート（Supabase中心版） |
