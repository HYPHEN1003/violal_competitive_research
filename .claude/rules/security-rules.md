---
paths:
  - ".env*"
  - "src/lib/auth/**"
  - "supabase/migrations/**"
  - "src/middleware.ts"
  - "src/proxy.ts"
---

# セキュリティルール

## 環境変数の Git 履歴チェック
以下のコマンドで .env ファイルが過去にコミットされていないか確認する:
1. `git log --all --full-history -- .env`
2. `git log --all --full-history -- .env.local`
3. `git log --diff-filter=D -- .env*`

履歴に含まれている場合は `git filter-branch` または BFG Repo-Cleaner で除去し、全キーをローテーションする。

## NEXT_PUBLIC_ プレフィックスの誤用
- サーバーのみで使う値には `NEXT_PUBLIC_` を**絶対に付けない**
  - NG: `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`
  - NG: `NEXT_PUBLIC_STRIPE_SECRET_KEY`
  - NG: `NEXT_PUBLIC_DATABASE_URL`
- `NEXT_PUBLIC_` はクライアントに公開される。ブラウザの DevTools で誰でも見られる

## Stripe キー保護
- `sk_live_` で始まるキーをクライアント側コード・ログ・エラーメッセージに露出させない
- Server Actions / Route Handlers 内でのみ使用する
- webhook シークレット（`whsec_`）も同様

## Supabase キー管理
- `service_role` キーはサーバーサイドのみで使用する
- クライアント側には `anon` キーのみ公開する
- `service_role` キーが漏洩した場合は即座にダッシュボードからローテーション

## キーローテーション
- 90日を目安に API キーを更新する
- 漏洩の疑いがある場合は即座にローテーション
- ローテーション後は全環境（local / preview / production）の環境変数を更新

## HTML の注意点
- HTML の class 属性を2つ書くと、2つ目は無視される — スタイルバグの原因
