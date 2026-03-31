---
name: bedrock-setup
description: "[OPTIONAL] Amazon Bedrock移行チェックリスト。前提: AWSアカウント。「Bedrock」「AWS」「推論プロファイル」と言われた時に使用。"
---

# Amazon Bedrock セットアップ

Anthropic API から Amazon Bedrock への移行を案内する。東京リージョンでの運用に特化。

## 最大のハマりポイント

**JP推論プロファイルIDとモデルIDは別物。**

- コンソール表示のモデルID: `anthropic.claude-sonnet-4-6-20260514`
- 実際に使うプロファイルID: `jp.anthropic.claude-sonnet-4-6`

東京リージョンでは on-demand throughput では Claude 4.x 系が使用不可。**JP推論プロファイルが必須。**

## 7ステップセットアップ

### Step 1: AWS アカウント準備
- Bedrock が利用可能なリージョン（ap-northeast-1: 東京）を確認

### Step 2: Marketplace サブスクリプション
- Bedrock コンソール → モデルアクセス → Claude モデルを有効化
- **コツ**: Playground で一度呼び出すと自動的にサブスクリプションが有効化される

### Step 3: IAM ポリシー設定
```json
{
  "Effect": "Allow",
  "Action": "bedrock:InvokeModel",
  "Resource": "arn:aws:bedrock:*::inference-profile/jp.anthropic.*"
}
```
**注意**: Resource は `inference-profile` 形式。モデル ARN ではない。

### Step 4: SDK インストール
```bash
npm install @anthropic-ai/bedrock-sdk
```

### Step 5: コード変更（最小限）
```typescript
// Before: Anthropic API
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();

// After: Bedrock
import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
const client = new AnthropicBedrock();
```

`messages.create()` の呼び出しはそのまま使える。model パラメータのみ変更:
```typescript
const response = await client.messages.create({
  model: 'jp.anthropic.claude-sonnet-4-6',  // JP推論プロファイルID
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello' }],
});
```

### Step 6: 環境変数設定
```
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=（IAMユーザーのアクセスキー）
AWS_SECRET_ACCESS_KEY=（IAMユーザーのシークレットキー）
```

### Step 7: 動作確認
- Playground で応答を確認
- ログで推論プロファイルIDが正しく使われているか確認

## トラブルシューティング
- `AccessDeniedException` → IAM ポリシーの Resource を確認
- `ModelNotAvailableException` → JP推論プロファイルIDを使っているか確認
- レスポンスが遅い → 東京+大阪の国内完結ルーティングを確認
