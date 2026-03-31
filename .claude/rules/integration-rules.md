---
paths:
  - "src/lib/integrations/**"
  - "src/app/api/webhooks/**"
  - "src/lib/line/**"
  - "src/lib/stripe/**"
---

# 外部サービス連携ルール

## LINE

### ID 体系の区別
- **Messaging API の `userId`** と **OA Manager の `chatUserId`** は別物
- 混同するとメッセージ送信先を間違える
- LINE bot のユーザーID マッピングが必要な場合は、明示的に変換テーブルを作成する

### webhook
- 署名検証を必ず行う（`X-Line-Signature` ヘッダ）
- リプライトークンは1回しか使えない（再利用不可）

## Stripe

### webhook 署名検証
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```
署名検証なしで webhook を処理してはいけない。

### 冪等性
- 冪等性キーを使用して重複処理を防ぐ
- 同じイベントが複数回送信される可能性がある

### タイムアウト
- webhook は10秒以内にレスポンスを返す
- 重い処理は非同期で実行し、即座に 200 を返す

## 外部 API 共通パターン

### タイムアウト
- 全ての外部 API 呼び出しにタイムアウトを設定する（デフォルト: 10秒）
- `AbortController` + `setTimeout` で実装

### リトライ
- Exponential backoff で実装（1s → 2s → 4s）
- 最大リトライ回数を設定する（デフォルト: 3回）
- 4xx エラーはリトライしない（クライアントエラー）
- 5xx / ネットワークエラーのみリトライ

### エラーハンドリング
- エラー時のフォールバック動作を定義する
- Sentry にエラーを報告する
- ユーザーに適切なエラーメッセージを表示する
