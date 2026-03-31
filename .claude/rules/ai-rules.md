---
paths:
  - "src/lib/ai/**"
  - "src/lib/ai.ts"
  - "src/app/api/**/chat/**"
  - "src/app/api/**/generate/**"
  - "src/app/**/ai*.ts"
---

# AI 機能実装ルール

## Amazon Bedrock
- 東京リージョンでは **JP推論プロファイルID** を使用する（モデルID ではない）
  - 例: `jp.anthropic.claude-sonnet-4-6`（コンソール表示の `anthropic.claude-sonnet-4-6-20260514` ではない）
- `@anthropic-ai/bedrock-sdk` 経由でアクセスする（直接 API コール禁止）

## Llama Cloud
- PDF 解析は **LlamaParse API** を使用する（PDF パーサー自作禁止）
- RAG パイプラインは **LlamaIndex** のインデックスを活用する
- `LLAMA_CLOUD_API_KEY` を環境変数で管理する

## プロンプトインジェクション防御（4原則）

### 1. ロール分離
system と user を混在させない:
```typescript
const response = await client.messages.create({
  system: 'あなたは○○のアシスタントです。',  // システム指示
  messages: [
    { role: 'user', content: userInput },       // ユーザー入力は必ず user ロール
  ],
});
```

### 2. 入力制限
- 長さ上限を設定する（例: 2000文字）
- HTML タグ・マークダウン記法を除去する
- 制御文字を除去する

### 3. 出力バリデーション
- レスポンスにシークレット（API キー等）が含まれていないかチェック
- XSS 防止: レスポンスを HTML に埋め込む前にサニタイズ
- Zod でパースして期待する構造か検証

### 4. 外部データ不信頼
- DB から取得したデータも user ロール経由で渡す
- 外部 API レスポンスも同様

## コスト管理
- 全 AI 呼び出しでトークン使用量をログに記録する
- 月次でコスト集計を行う
- AI エンドポイントにはレート制限を設定する
