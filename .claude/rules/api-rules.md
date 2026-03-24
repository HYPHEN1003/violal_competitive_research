---
paths:
  - "src/app/api/**/*.ts"
  - "src/app/api/**/*.tsx"
  - "src/app/**/actions.ts"
---

# API / Server Actions ルール

- Server Actionsを使用する（REST / GraphQL自作禁止）
- 入力は必ずZodスキーマでバリデーションする
- エラーレスポンスは統一フォーマットで返す
- APIキー・シークレットはハードコードしない（環境変数を使用）
- 認証が必要なエンドポイントは必ず認証チェックを入れる
- レート制限が必要な場合はCloudflareに委譲する（自作しない）

## AI API 呼び出しのセキュリティ（プロンプトインジェクション対策）

AI（Claude API等）を呼び出すコードでは、以下を必ず守る。

### 1. ロール分離を徹底する
- システム指示は `system` ロール、ユーザー由来のデータは `user` ロールに分離する
- **絶対に** ユーザー入力をシステムプロンプトに文字列結合しない

```typescript
// NG: ユーザー入力がシステム指示と混在
const response = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  messages: [{ role: "user", content: `指示: ${systemPrompt}\nデータ: ${userData}` }],
})

// OK: ロールで明確に分離
const response = await client.messages.create({
  model: "claude-haiku-4-5-20251001",
  system: systemPrompt,
  messages: [{ role: "user", content: userData }],
})
```

### 2. 入力を制限する
- ユーザー由来のテキストは **長さ上限** を設ける（例: 2000文字）
- 不要なHTML/マークダウンタグを除去する
- 制御文字を除去する

### 3. 出力をバリデーションする
- AIの応答にシークレット（API キー、接続文字列等）が含まれていないか検証する
- AIの応答を生HTMLとしてレンダリングしない（XSSリスク）
- 構造化出力が期待される場合は Zod でパースする

### 4. 外部データを信頼しない
- DBから取得した顧客データ・コメント等もインジェクションの経路になりうる
- 外部APIレスポンスも同様に信頼しない
- 全てを `user` ロール経由で渡す
