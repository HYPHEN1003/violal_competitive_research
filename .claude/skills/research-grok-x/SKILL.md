---
name: research-grok-x
description: Grok APIでXのリアルタイム検索。「Xで調べて」「最新のAIニュース」「Twitterで○○を検索」「Grokで調べて」と言われた時に使用。
---

# Grok API × X リアルタイム検索

AI・業界ニュースの最速手段。Google検索より速い（Xで話題→数時間後にニュースサイト）。

## 前提
- xAI API キーが必要: `XAI_API_KEY` を環境変数に設定
- APIドキュメント: https://docs.x.ai/

## 使い方

### 基本検索
ユーザーから検索テーマを受け取り、Grok APIの `x_search` 機能で検索。

```bash
curl -s https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-3",
    "messages": [
      {"role": "system", "content": "Xのリアルタイム投稿を検索して、最新情報をまとめてください。日本語で回答。"},
      {"role": "user", "content": "{検索クエリ}"}
    ],
    "tools": [{"type": "x_search"}]
  }'
```

### よく使う検索パターン

| 目的 | クエリ例 |
|------|---------|
| AI速報 | 「Claude Code 新機能」「OpenAI リリース」 |
| 競合動向 | 「{競合名} 資金調達」「{競合名} 新サービス」 |
| 業界トレンド | 「歯科 AI」「保険 DX」 |
| セミナーネタ | 「AI研修 企業」「AI活用 事例」 |

## 出力形式

```markdown
## X検索結果: {クエリ} — {日付}

### 主要トピック
1. {話題1}: {要約}（投稿者: @xxx, エンゲージメント: いいね○○）
2. {話題2}: {要約}
3. {話題3}: {要約}

### 注目すべきポイント
- {発見・示唆}

### アクション候補
- [ ] {この情報を使ってやるべきこと}
```

保存先: `docs/research/{date}-x-{topic}.md`

## 注意
- APIキーは環境変数から読む（ハードコード禁止）
- 1日のAPI呼び出し回数に注意（コスト管理）
- 未確認情報はファクトチェックが必要
