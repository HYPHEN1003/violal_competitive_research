---
name: research-google-trends
description: Google Trendsでキーワードの検索ボリューム推移を分析。「トレンド調べて」「検索ボリューム」「Google Trends」「需要の変化」と言われた時に使用。
---

# Google Trends リサーチ

検索ボリュームの推移 = 市場需要の先行指標。急上昇キーワードはセミナーテーマ・記事ネタの最良の情報源。

## 使い方

### 方法1: pytrends（Python）
```bash
pip install pytrends  # 初回のみ
```

```python
from pytrends.request import TrendReq
pytrends = TrendReq(hl='ja-JP', tz=540)

# キーワードのトレンド取得
pytrends.build_payload(['{キーワード}'], timeframe='today 3-m', geo='JP')
df = pytrends.interest_over_time()
print(df)

# 関連キーワード取得（急上昇ワード）
related = pytrends.related_queries()
print(related['{キーワード}']['rising'])
```

### 方法2: SerpApi（API経由）
```bash
curl "https://serpapi.com/search?engine=google_trends&q={キーワード}&geo=JP&api_key=$SERPAPI_KEY"
```

### 方法3: ブラウザ直接（最も手軽）
https://trends.google.co.jp/trends/ でキーワードを入力し、スクリーンショットをClaude Codeに渡す。

## よく使う分析パターン

| 目的 | やること |
|------|---------|
| **セミナーテーマ決定** | 「AI研修」「Claude Code」「AI活用」の推移比較 |
| **市場需要の変化** | クライアント業界のキーワード推移（「歯科 AI」「保険 DX」等） |
| **記事ネタ発掘** | 関連キーワードの「急上昇」を確認 |
| **競合監視** | 競合名の検索ボリューム変化 |
| **新規事業判断** | 参入検討領域のトレンドが上昇中か確認 |

## 出力形式

```markdown
## Google Trends分析: {キーワード} — {日付}

### トレンド概要
- 期間: {3ヶ月/12ヶ月/5年}
- 傾向: {上昇/横ばい/下降}
- ピーク: {日付}（{イベント名}が原因と推測）

### 関連キーワード（急上昇）
1. {キーワード1} — 上昇率{N}%
2. {キーワード2} — 上昇率{N}%

### アクション候補
- [ ] {急上昇キーワードに基づくアクション}
```

保存先: `docs/research/{date}-trends-{topic}.md`

## 実例
「Claude Code」のサジェストに「Claude Code 研修」が出始めた → LP作成を判断
→ Googleサジェストの変化は市場需要の変化の先行指標
