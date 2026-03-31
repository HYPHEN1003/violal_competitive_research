#!/bin/bash
# Stripe/Supabase/JWTキーの漏洩を検知してブロックするフック
# PreToolUse: Bash, Write, Edit にマッチ
# 依存: jq（未インストール時はapproveにフォールバック）

# jq 存在チェック
if ! command -v jq &> /dev/null; then
  echo '{"decision":"approve","message":"警告: jqが未インストールのため、キー漏洩チェックをスキップしました。brew install jq を推奨。"}'
  exit 0
fi

# フックプロファイル対応
PROFILE="${HOOK_PROFILE:-standard}"
if [ "$PROFILE" = "minimal" ]; then
  echo '{"decision":"approve"}'
  exit 0
fi

INPUT=$(cat)

# Bash の場合はコマンドを、Write/Edit の場合はコンテンツをチェック
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null)
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // ""' 2>/dev/null)
CHECK_TARGET="${COMMAND}${CONTENT}"

# --- Stripe 本番キー ---
if echo "$CHECK_TARGET" | grep -qE "sk_live_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripe本番シークレットキー (sk_live_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Stripe テストキー ---
if echo "$CHECK_TARGET" | grep -qE "sk_test_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripeテストキー (sk_test_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Stripe 制限キー ---
if echo "$CHECK_TARGET" | grep -qE "rk_live_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripe制限キー (rk_live_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Stripe Webhookシークレット ---
if echo "$CHECK_TARGET" | grep -qE "whsec_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripe Webhookシークレット (whsec_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Supabase JWT (service_role等) ---
if echo "$CHECK_TARGET" | grep -qE "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{50,}"; then
  echo '{"decision":"block","reason":"Supabase JWT（service_role等）の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# 全チェック通過
echo '{"decision":"approve"}'
