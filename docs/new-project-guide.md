# 新プロジェクト立ち上げガイド

hyphen-project-starterから新プロジェクトを作成する際の手順と、Claude Codeとの壁打ちフローを定義する。

## 概要

```
hyphen-project-starter（汎用） → コピー → 壁打ち → カスタマイズ → 開発開始
```

---

## STEP 1: プロジェクトの初期セットアップ

### 手順
```bash
# 1. テンプレートからコピー
gh repo create HYPHEN1003/[project-name] --template HYPHEN1003/hyphen-project-starter --private
gh repo clone HYPHEN1003/[project-name]
cd [project-name]

# 2. Claude Codeを起動
claude
```

### Claude Codeに伝えること
```
hyphen-project-starterから新プロジェクトを立ち上げます。
docs/new-project-guide.md に従って壁打ちを進めてください。
```

---

## STEP 2: 壁打ち — プロジェクト概要の定義

Claude Codeが以下の質問をする。回答をもとにCLAUDE.mdを埋める。

### 必須質問（必ず聞く）

#### Q1. プロジェクトの目的
> 「何を作りますか？誰のために、何を解決するサービスですか？」

→ CLAUDE.md の `プロジェクト概要` に反映

#### Q2. クライアント情報
> 「クライアントは誰ですか？（自社 or 受託）どんな業種・立場の方ですか？」

→ CLAUDE.md の `クライアント` に反映

#### Q3. コンセプト
> 「このサービスを一言で表すと？ブランドの方向性は？」

→ CLAUDE.md の `コンセプト` に反映

#### Q4. 構成要素
> 「何を作りますか？例: Web LP、管理画面、LINE Bot、モバイルアプリ等」

→ CLAUDE.md の `構成要素` に反映

---

## STEP 3: 壁打ち — デザイン方針の決定

#### Q5. デザインの方向性
> 「どんな印象にしたいですか？例: モダン・ミニマル、高級感、親しみやすい、和風、クリニカル等」

#### Q6. カラー
> 「ブランドカラーはありますか？なければターゲット層と業種から提案します。」

- 背景色
- テキスト色
- アクセント色
- CTA色

#### Q7. フォント
> 「フォントの希望はありますか？なければ方向性に合うものを提案します。」

- 本文フォント
- 見出しフォント

→ CLAUDE.md の `デザイン方針` に反映
→ 必要に応じてデザインシステム（Tailwind config）にも反映

---

## STEP 4: 壁打ち — ユーザー設計

#### Q8. ターゲットユーザー
> 「メインのターゲットユーザーは誰ですか？年齢層、職業、リテラシーレベルは？」

#### Q9. ユーザージャーニー
> 「ユーザーにどんな体験をしてほしいですか？初回訪問から成約までの流れをイメージで教えてください。」

#### Q10. 行動変容の設計
> 「ユーザーにどんな行動を取ってもらいたいですか？そのために大切にしたいUXの原則は？」

→ CLAUDE.md の `ユーザージャーニー` と `行動変容の設計原則` に反映

---

## STEP 5: 壁打ち — 技術スタックの確認

#### Q11. 技術スタックの変更点
> 「デフォルトの技術スタック（Next.js + Supabase + Vercel）から変更する箇所はありますか？」

以下の観点で確認:
- 認証: Supabase Auth → Clerk に変える？
- 決済: Stripe は必要？
- AI: Claude API を使う機能はある？
- リアルタイム: Supabase Realtime は必要？
- ファイルアップロード: Supabase Storage は必要？
- LINE連携: LINE Messaging API は必要？

→ CLAUDE.md の `技術スタック` を更新

---

## STEP 6: 壁打ち — プロジェクト固有ルール

#### Q12. 絶対ルール
> 「このプロジェクト固有の絶対ルールはありますか？例: 他院のデータが見えてはいけない（マルチテナント）、特定の表現を使ってはいけない等」

#### Q13. 禁止語
> 「業界やクライアント固有のNG表現はありますか？」

→ CLAUDE.md の `絶対ルール` と `禁止語` に反映

---

## STEP 7: ルールのカスタマイズ

壁打ち結果を踏まえて、以下を更新する。

### 更新対象

| ファイル | 更新内容 |
|----------|---------|
| `CLAUDE.md` | Q1〜Q13の回答で全プレースホルダーを埋める |
| `.claude/rules/api-rules.md` | プロジェクト固有のAPIルールを追記 |
| `.claude/rules/db-rules.md` | プロジェクト固有のDB命名規則・RLSルールを追記 |
| `.claude/rules/ui-rules.md` | プロジェクト固有のUIルール・デザイントークンを追記 |
| `.claude/agents/` | 不要なエージェントを削除、必要に応じて追加 |
| `.claude/skills/` | 不要なスキルを削除、必要に応じて追加 |

### 判断基準

- **LINE Bot なし** → `create-flex-message` スキルを削除
- **LP なし** → `create-lp-section`, `marketing-asset-factory` スキルを削除
- **Figma 不使用** → `figma-*` スキルを削除
- **AI機能なし** → `prompt-engineer` エージェント、`review-prompt` スキルを削除

---

## STEP 8: 開発開始

```bash
# 依存関係インストール
cd src && npm install

# 開発サーバー起動
npm run dev

# 最初のコミット
git add -A
git commit -m "chore: initialize project from hyphen-project-starter"
git push -u origin main
```

### 最初にやること（Day 1 チェックリスト）
- [ ] CLAUDE.md のプレースホルダーが全て埋まっている
- [ ] Sentry のプロジェクトを作成し、DSNを `.env.local` に設定
- [ ] PostHog のプロジェクトを作成し、キーを `.env.local` に設定
- [ ] Supabase のプロジェクトを作成（必要な場合）
- [ ] Vercel にデプロイ接続
- [ ] GitHub Actions の CI が通る
- [ ] `tasks/todo.md` に最初のマイルストーンを書く

---

## 壁打ちフロー図

```
ユーザー: 「新プロジェクトを始めたい」
    ↓
Claude: Q1-Q4（プロジェクト概要）
    ↓
Claude: Q5-Q7（デザイン方針）
    ↓
Claude: Q8-Q10（ユーザー設計）
    ↓
Claude: Q11（技術スタック確認）
    ↓
Claude: Q12-Q13（固有ルール）
    ↓
Claude: CLAUDE.md + rules を自動更新
    ↓
Claude: Day 1 チェックリストを提示
    ↓
開発スタート
```
