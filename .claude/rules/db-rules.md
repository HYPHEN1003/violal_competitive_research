---
paths:
  - "supabase/**/*.sql"
  - "supabase/**"
  - "src/lib/supabase/**"
---

# データベースルール

- テーブル名は英語スネークケース（例: `user_profiles`）
- 主キーは `id uuid DEFAULT gen_random_uuid()`
- 全テーブルに `created_at timestamptz DEFAULT now()` と `updated_at` を付与
- 外部キー制約を必ず設定する
- RLSは全テーブルで有効化する（例外なし）
- ソフトデリート（`deleted_at`）を基本とする
- マイグレーションは段階的に行い、破壊的変更を避ける
- supabase-jsクライアントを使用する（直接SQL発行は避ける）

## Prisma 7 + Supabase 接続
- Supabase Pooler 使用時は `aws-X` 番号（例: `aws-0-ap-northeast-1`）を正しく設定する
- IPv6 環境では Pooler 接続が必要（直接接続は IPv4 のみ）
- `ssl` オプションの設定: `{ rejectUnauthorized: false }` が必要な場合がある

## Supabase Auth 一括ユーザー作成
- SQL の `crypt()` は GoTrue の bcrypt 実装と非互換 → `admin.createUser()` のみ使用する
- 仮メール変換パターン: `{識別子}@{prefix}.{domain}` で Signup OFF のまま運用可能

## RLS ポリシーパターン
- `auth.uid()` は直接呼ばず `(SELECT auth.uid())` を使用する（パフォーマンス最適化）
- 全テーブルに RLS が有効化されているか定期的に監査する
