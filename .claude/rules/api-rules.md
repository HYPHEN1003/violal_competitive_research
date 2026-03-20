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
