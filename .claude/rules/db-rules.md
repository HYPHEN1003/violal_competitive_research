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
