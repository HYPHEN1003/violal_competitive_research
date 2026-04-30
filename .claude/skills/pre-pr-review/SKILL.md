---
name: pre-pr-review
description: Use when user says "PRレビュー", "PR前チェック", "レビューして", "マージ前確認", or is about to create a pull request and needs a 2-AI (Claude + Codex) quality check with MCO.
---

# PR前レビュー — MCO 2AIレビュースキル

PR作成前に、2つのAI（Claude Code, Codex）で同時にコードレビューを実行し、結果を保存する。

## 実行手順

### Step 1: レビュー対象の確認

まずユーザーに確認する:
> 「PRレビューを実行します。対象はどれですか？」
> - **A**: 最新の差分のみ（`--diff`）— 直近の変更だけチェック
> - **B**: リポジトリ全体（`--review`）— 全体的な品質チェック
> - **C**: セキュリティ特化（`--security`）— OWASP Top 10 重点

### Step 2: MCOレビュー実行

ユーザーの選択に応じてコマンドを実行:

**A: 差分レビュー**
```bash
mco review --repo . --diff \
  --prompt "この変更のコード品質・セキュリティ・パフォーマンスをレビュー。重要度順（Critical→Important→Suggestion）で報告。日本語で回答。" \
  --providers claude,codex --format report
```

**B: 全体レビュー**
```bash
mco review --repo . \
  --prompt "コード品質・セキュリティ・パフォーマンスをレビュー。重要度順（Critical→Important→Suggestion）で報告。日本語で回答。" \
  --providers claude,codex --format report
```

**C: セキュリティレビュー**
```bash
mco review --repo . \
  --prompt "セキュリティ脆弱性を重点レビュー。OWASP Top 10、認証・認可、RLS、シークレット漏洩、インジェクション。日本語で回答。" \
  --providers claude,codex --format report
```

### Step 3: 結果の保存

レビュー結果を以下のフォーマットで保存する:

**ファイル名**: `docs/reviews/YYYY-MM-DD-[branch-name].md`

**フォーマット**:
```markdown
# MCOレビュー結果

> 日付: YYYY-MM-DD
> ブランチ: [branch-name]
> レビュー種別: [差分 / 全体 / セキュリティ]
> AI: Claude Code, Codex

## サマリー
[2つのAIの指摘をまとめた要約。両方のAIが指摘した内容はconfirmed、1つのAIだけの指摘はneeds-verificationとする]

## Critical（対応必須）
- [ ] [指摘内容]（confirmed / needs-verification）

## Important（対応推奨）
- [ ] [指摘内容]（confirmed / needs-verification）

## Suggestion（検討）
- [指摘内容]

## 良い点
- [2つのAIが評価した良い点]
```

### Step 4: 対応判断

結果を見せた後、ユーザーに確認する:
> 「レビュー結果を `docs/reviews/YYYY-MM-DD-[branch].md` に保存しました。」
> - Critical項目がある場合: 「Critical指摘が[N]件あります。修正してからPR作成を推奨します。」
> - Criticalなしの場合: 「Critical指摘はありません。PR作成に進んでよさそうです。」

## ルール
- MCOがインストールされていない場合はインストール手順を案内する
- レビュー結果は必ずファイルに保存する（ターミナル表示だけで終わらせない）
- confirmed（両方のAIが指摘）は対応を強く推奨する
- needs-verification（1つのAIだけの指摘）はユーザー判断に委ねる
