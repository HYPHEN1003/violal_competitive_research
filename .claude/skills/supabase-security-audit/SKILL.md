---
name: supabase-security-audit
description: Supabaseセキュリティ一括監査。「RLS監査」「セキュリティ監査」「anon権限」「SECURITY DEFINER」と言われた時に使用。
---

# Supabase セキュリティ一括監査

8プロジェクト38エラーを一括修正した実績に基づくセキュリティ監査フロー。

## 監査チェックリスト

### 1. RLS 有効化確認

全テーブルで RLS が有効か確認:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

未設定テーブルがあれば即座に有効化:
```sql
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;
```

### 2. RLS ポリシー追加

基本パターン（認証ユーザーのみ自分のデータにアクセス）:
```sql
CREATE POLICY "Users can view own data"
ON public.{table_name}
FOR SELECT
USING ((SELECT auth.uid()) = user_id);
```

**注意**: `auth.uid()` ではなく `(SELECT auth.uid())` を使う（パフォーマンス最適化）。

### 3. SECURITY DEFINER → INVOKER 移行

`SECURITY DEFINER` 関数はRLSをバイパスするため危険:
```sql
-- 現状確認
SELECT proname, prosecdef
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace AND prosecdef = true;

-- 移行
ALTER FUNCTION public.{function_name} SECURITY INVOKER;
```

### 4. anon ロール権限監査

anon ロールに不要な権限がないか確認:
```sql
SELECT table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'anon';
```

不要な権限を剥奪:
```sql
REVOKE ALL ON public.{table_name} FROM anon;
GRANT SELECT ON public.{table_name} TO anon;  -- 必要な権限のみ付与
```

### 5. Supabase Management API での実行

ダッシュボードの SQL Editor が使えない場合:
```bash
curl -X POST 'https://api.supabase.com/v1/projects/{ref}/database/query' \
  -H 'Authorization: Bearer {management_api_token}' \
  -H 'Content-Type: application/json' \
  -d '{"query": "ALTER TABLE public.xxx ENABLE ROW LEVEL SECURITY;"}'
```

## 出力
- 修正 SQL スクリプト一式（コピペで実行可能）
- 修正前後の権限比較表
- 残存リスクの報告
