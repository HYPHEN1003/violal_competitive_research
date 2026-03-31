---
name: supabase-bulk-users
description: Supabase Auth一括ユーザー作成。「一括登録」「バルクユーザー」「学籍番号ログイン」「大量ユーザー作成」と言われた時に使用。
---

# Supabase Auth 一括ユーザー作成

126名の学生を学籍番号でログインさせた実績に基づく手順。

## 最重要ポイント

**SQL の `crypt()` は使わない。** GoTrue の bcrypt 実装と非互換のため、SQL で直接 INSERT してもログインできない。

**`admin.createUser()` のみ使用する。**

## フェイクメール変換パターン

Supabase Auth はメール認証が前提のため、学籍番号等の非メール ID を仮メールに変換する:

```
{学籍番号}@student.{domain}
例: 2024001@student.example.com
```

## 一括作成スクリプト

```javascript
// scripts/create-users.mjs
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service_role キーが必要
);

const users = [
  { id: '2024001', password: 'initial-password-001' },
  { id: '2024002', password: 'initial-password-002' },
  // ... CSV から読み込む
];

const results = { success: [], failed: [] };

for (const user of users) {
  const email = `${user.id}@student.example.com`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: user.password,
    email_confirm: true,  // メール確認をスキップ
  });

  if (error) {
    results.failed.push({ id: user.id, error: error.message });
  } else {
    results.success.push({ id: user.id, uid: data.user.id });
  }

  // レート制限回避（逐次実行）
  await new Promise(r => setTimeout(r, 100));
}

console.log(`成功: ${results.success.length}, 失敗: ${results.failed.length}`);
if (results.failed.length > 0) {
  console.log('失敗リスト:', results.failed);
}
```

## 実行方法

```bash
node --env-file=.env.local scripts/create-users.mjs
```

**`node --env-file`** を使えば dotenv 不要で環境変数を安全に読み込める。

## UI 側のログイン ID 変換

```typescript
// lib/auth.ts
export function resolveLoginId(loginId: string, domain: string): string {
  // 学籍番号 → 仮メールに変換
  return `${loginId}@student.${domain}`;
}
```

## 注意事項
- **Signup は必ず OFF** にする（管理者のみがユーザー作成可能）
- Supabase ダッシュボード → Authentication → Settings → Enable Sign Ups を OFF
- 既存ユーザーのスキップ: エラーメッセージに "already registered" が含まれたらスキップ
- パスワードは初回ログイン後に変更を強制する仕組みを検討
