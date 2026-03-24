# セキュリティチェックリスト

リリース前に全項目を確認すること。

## Claude Code セキュリティ設定
- [ ] `.claude/settings.json` の deny ルールがプロジェクトの機密ファイルを網羅している
- [ ] `guard-dangerous-commands.sh` フックが有効（破壊的コマンドのブロック）
- [ ] `/permissions` で現在の許可状況を確認し、不要な許可を削除
- [ ] `NEXT_PUBLIC_` 以外の環境変数が Claude Code のコンテキストに漏れていないか確認
- [ ] チーム開発の場合: 組織の `.claude/settings.json` ポリシーと整合しているか確認

## 認証・認可
- [ ] Supabase RLS が全テーブルで有効
- [ ] 認証が必要なページに未認証アクセスでリダイレクトされる
- [ ] JWT の有効期限が適切（デフォルト: 1時間）
- [ ] パスワードポリシーが設定済み

## 環境変数・シークレット
- [ ] `.env` がコミットされていない（`.gitignore` で除外済み）
- [ ] 本番環境の環境変数は Vercel Dashboard で管理
- [ ] `NEXT_PUBLIC_` プレフィックスはクライアント公開可の値のみ
- [ ] APIキーのスコープが最小権限

## 入力バリデーション
- [ ] Server Actions の入力を Zod でバリデーション
- [ ] ファイルアップロードのサイズ・型を制限
- [ ] SQLインジェクション対策（Supabase クライアント使用で自動対応）

## AI機能（プロンプトインジェクション対策）
- [ ] システムプロンプトとユーザー入力が `system` / `user` ロールで分離されている
- [ ] ユーザー由来テキストに長さ上限を設定している（`lib/ai.ts` の `sanitizeUserInput` 参照）
- [ ] AI応答にシークレット情報が含まれていないか検証している（`containsSecrets` 参照）
- [ ] AI応答を生HTMLとしてレンダリングしていない（XSSリスク）
- [ ] DB由来データ・外部APIレスポンスも `user` ロール経由で渡している
- [ ] 構造化出力を期待する場合は Zod でパース・検証している（`parseAIResponse` 参照）

## フロントエンド
- [ ] XSS 対策（生HTMLの埋め込みを避ける or サニタイズ済み）
- [ ] CSRF 対策（Server Actions はデフォルトで対策済み）
- [ ] Content Security Policy ヘッダー設定

## インフラ
- [ ] Cloudflare WAF / Rate Limiting 設定済み
- [ ] HTTPS 強制（Vercel デフォルト）
- [ ] エラートラッキング（Sentry）設定済み
- [ ] 不要なAPIルートが公開されていない

## 依存関係
- [ ] `npm audit` で critical / high の脆弱性なし
- [ ] 不要なパッケージを削除済み

## ログ・監視
- [ ] 本番環境で `console.log` にシークレット情報を出力していない
- [ ] Sentry でエラー通知が機能している
- [ ] PostHog でユーザー行動が取得できている
