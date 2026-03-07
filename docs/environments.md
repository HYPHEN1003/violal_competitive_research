# 環境構成

## 環境一覧

| 環境 | URL | ブランチ | 用途 |
|------|-----|---------|------|
| Local | http://localhost:3000 | feature/* | 開発・デバッグ |
| Preview | Vercel自動生成 | PR作成時 | レビュー・動作確認 |
| Production | [PRODUCTION_URL] | main | 本番 |

## 環境変数の管理

### ローカル開発
```bash
cp .env.example .env.local
# .env.local に値を設定
```

### Vercel（Preview / Production）
Vercel Dashboard > Settings > Environment Variables で管理。
- **Production**: main ブランチのデプロイに適用
- **Preview**: PR のプレビューデプロイに適用
- **Development**: `vercel env pull` でローカルに取得可能

## Supabase プロジェクト

| 環境 | プロジェクト | 用途 |
|------|------------|------|
| Development | [DEV_PROJECT] | ローカル開発・Preview |
| Production | [PROD_PROJECT] | 本番 |

## デプロイフロー

```
feature branch → PR → Preview URL で確認 → main にマージ → 自動デプロイ
```
