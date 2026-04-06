---
name: research-hackernews
description: HackerNewsのトップ記事・トレンド分析。「HackerNews」「HN」「エンジニアのトレンド」「開発者の間で話題」と言われた時に使用。
---

# HackerNews リサーチ

開発者コミュニティのトレンドを掴む最適な情報源。HNで話題になった技術は1-2週間後に日本のXでバズる傾向。

## API（無料・認証不要）

### トップ記事取得
```bash
# トップ30記事のID取得
curl -s "https://hacker-news.firebaseio.com/v0/topstories.json" | jq '.[0:30]'

# 個別記事の詳細取得
curl -s "https://hacker-news.firebaseio.com/v0/item/{id}.json" | jq '{title, url, score, descendants}'
```

### 検索（Algolia HN Search API）
```bash
# キーワード検索（スコア順）
curl -s "https://hn.algolia.com/api/v1/search?query={キーワード}&tags=story&hitsPerPage=10" | jq '.hits[] | {title, url, points, num_comments}'

# 日付指定（過去24時間）
curl -s "https://hn.algolia.com/api/v1/search_by_date?query={キーワード}&tags=story&numericFilters=created_at_i>{unix_timestamp}" | jq '.hits[] | {title, url, points}'
```

## 自動リサーチフロー

### Step 1: トップ記事取得
トップ30記事を取得し、AI関連をフィルタリング。

### Step 2: スコア分析
- 500+ ポイント: 業界全体に影響するニュース
- 200-500: 開発者間で注目のトピック
- 100-200: ニッチだが重要な動向

### Step 3: コメント分析
高スコア記事のコメントから:
- 開発者の本音（批判・賞賛のパターン）
- 実際に使った人のフィードバック
- 代替ツール/手法の提案

## よく使う検索クエリ

| 目的 | クエリ |
|------|--------|
| AI全般 | `Claude`, `OpenAI`, `LLM`, `AI agent` |
| 開発ツール | `Claude Code`, `Cursor`, `Copilot` |
| インフラ | `Supabase`, `Vercel`, `Next.js` |
| セキュリティ | `AI security`, `prompt injection` |

## 出力形式

```markdown
## HackerNews トレンド — {日付}

### 注目記事 TOP 5
| # | タイトル | スコア | コメント数 | URL |
|---|---------|--------|-----------|-----|
| 1 | {title} | {score} | {comments} | {url} |

### AI関連ピックアップ
- **{タイトル}**: {要約}。{なぜ重要か}

### 1-2週間後に日本でバズりそうなネタ
- {予測と根拠}

### アクション候補
- [ ] {セミナーネタ/記事ネタとして使うか}
```

保存先: `docs/research/{date}-hn-digest.md`

## 活用のコツ
- 毎朝3分でトップ10を流し見するだけでOK
- AI関連で500+ポイントの記事は必ずチェック
- コメント欄に本当の価値がある（記事本文より示唆が深いことが多い）
