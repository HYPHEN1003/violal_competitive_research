# [PROJECT_NAME] プロジェクト

## プロジェクト概要
[PROJECT_DESCRIPTION — 1〜3行でプロジェクトの目的を記述]
- クライアント: [CLIENT_NAME]（[CLIENT_ROLE]）
- 開発: HYPHEN CO., LTD.（村田英司）
- サービス: [SERVICE_DESCRIPTION]
- コンセプト: [CONCEPT — ブランドの方向性を一言で]

## 技術スタック
以下はデフォルト構成。案件に応じて変更すること。
- Frontend: Next.js 15 (App Router) — `src/` ディレクトリ
- UI: Tailwind CSS + shadcn/ui
- Auth: Supabase Auth
- API: Server Actions
- DB: Supabase (PostgreSQL)
- Payment: Stripe
- AI: Claude API (claude-sonnet)
- Deploy: Vercel
- Monitoring: Sentry + PostHog
- File Upload: Supabase Storage
- Security: Cloudflare（DNS / CDN / WAF / Rate Limiting）
- Test: Vitest + Playwright
- CI: GitHub Actions

## 構成要素
1. [COMPONENT_1 — 例: Web LP、管理画面、モバイルアプリ等]
2. [COMPONENT_2 — 例: LINE Bot、チャットボット等]
3. [COMPONENT_3 — 例: 管理画面、ダッシュボード等]

## デザイン方針
- 方向性: [DESIGN_DIRECTION — 例: モダン・ミニマル、和風、クリニカル等]
- 背景: [BG_COLOR] （例: #F9F7F3）
- テキスト: [TEXT_COLOR] （例: #2D2D2D）
- アクセント: [ACCENT_COLOR] （例: #C4A97D）
- CTA: [CTA_COLOR] （例: #06C755）
- 本文フォント: [BODY_FONT] （例: Noto Sans JP）
- 見出しフォント: [HEADING_FONT] （例: Noto Serif JP）
- その他: [DESIGN_NOTES]

## ユーザー行動変容の設計原則
[プロジェクト固有のUX設計原則を記述]
- [PRINCIPLE_1]
- [PRINCIPLE_2]
- [PRINCIPLE_3]

## ユーザージャーニー
### Phase 1: [PHASE_1_NAME]
- [PHASE_1_DESCRIPTION]

### Phase 2: [PHASE_2_NAME]
- [PHASE_2_DESCRIPTION]

### Phase 3: [PHASE_3_NAME]
- [PHASE_3_DESCRIPTION]

## 開発哲学 — 自作禁止リスト
「何を作らないか」が最も重要な判断。以下は絶対に自作しない:
- Auth → Supabase Auth（RLS連携、ソーシャルログイン対応）
- UI → Tailwind + shadcn/ui（生CSS禁止）
- State → Zustand + Server Components（Redux禁止）
- API → Server Actions（REST / GraphQL自作禁止）
- Deploy → Vercel（手動デプロイ禁止）
- DB → Supabase Client（supabase-js）
- Validation → Zod + React Hook Form
- Payment → Stripe（決済自作禁止）
- Error → Sentry（Day1で設定）
- Analytics → PostHog（Day1で設定）
- Secrets → Vercel Env + .env（ハードコード禁止）
- File Upload → Supabase Storage
- Security → Cloudflare（WAF/レート制限自作禁止）
- Realtime → Supabase Realtime（WebSocket自作禁止）

## 作業プロセスルール

### 計画（Plan First）
- 3ステップ以上のタスクは必ずplan modeで計画を立ててから着手
- 計画は tasks/todo.md にチェックリスト形式で書き出す
- ユーザーに確認を取ってから実装に入る
- うまくいかなくなったら即座に止めて再計画

### サブエージェント活用
- メインのコンテキストを綺麗に保つため、調査・探索はサブエージェントに委譲
- 1サブエージェント1タスクの原則

### 完了前の検証
- 「動くことを証明」してからタスク完了
- Lighthouse 90+を出荷基準とする
- 「シニアエンジニアがレビューしてOKを出すか？」を自問

### ミスからの学習
- 修正指示を受けたら tasks/lessons.md にパターンを記録
- セッション開始時にlessons.mdを確認

### 品質基準
- シンプルさ最優先。変更は最小限のコードに留める
- 一時的な修正は禁止。根本原因を特定して直す
- 非自明な変更には「もっとエレガントな方法はないか？」を自問

## 開発コマンド
```bash
cd src
npm install          # 依存関係インストール
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # Lint実行
npm run test:run     # ユニットテスト実行
npm run test:e2e     # E2Eテスト実行
```

## 開発習慣ルール
- mainに直接pushしない → feature branchを使う
- Preview URLを必ず確認してからマージ
- 2-3機能ごとにリファクタリングタイムを取る
- 技術的判断は理由をドキュメントに残す
- 空状態・エラー状態・ローディング状態を必ず実装

## 絶対ルール
- APIキーやシークレット情報は絶対にコードに含めない
- [PROJECT_SPECIFIC_RULES — プロジェクト固有のルール]
- 禁止語: [BANNED_WORDS — 業界・クライアント固有のNG表現]

## 現在のフェーズ
[CURRENT_PHASE — 例: STEP 1: 提案準備]
次: [NEXT_STEP]
