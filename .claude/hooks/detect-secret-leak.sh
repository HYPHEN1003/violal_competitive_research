#!/bin/bash
# シークレットキーの漏洩を検知してブロックするフック
# PreToolUse: Bash, Write, Edit にマッチ

INPUT=$(cat)
source "$(dirname "$0")/_parse-input.sh"

# Bash の場合はコマンドを、Write/Edit の場合はコンテンツをチェック
COMMAND=$(_parse_field "$INPUT" "command")
CONTENT=$(_parse_nested_field "$INPUT" "content" "new_string")
CHECK_TARGET="${COMMAND}${CONTENT}"

# パース結果が空でも INPUT 全体をフォールバック対象にする（二重防御）
if [ -z "$CHECK_TARGET" ]; then
  CHECK_TARGET="$INPUT"
fi

# === キー検出パターン ===

# --- Stripe ---
if echo "$CHECK_TARGET" | grep -qE "sk_live_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripe本番シークレットキー (sk_live_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

if echo "$CHECK_TARGET" | grep -qE "sk_test_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripeテストキー (sk_test_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

if echo "$CHECK_TARGET" | grep -qE "rk_live_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripe制限キー (rk_live_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

if echo "$CHECK_TARGET" | grep -qE "whsec_[a-zA-Z0-9]{20,}"; then
  echo '{"decision":"block","reason":"Stripe Webhookシークレット (whsec_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Supabase JWT ---
if echo "$CHECK_TARGET" | grep -qE "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{50,}"; then
  echo '{"decision":"block","reason":"Supabase JWT（service_role等）の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Anthropic APIキー ---
if echo "$CHECK_TARGET" | grep -qE "sk-ant-[a-zA-Z0-9_-]{20,}"; then
  echo '{"decision":"block","reason":"Anthropic APIキー (sk-ant-) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- OpenAI APIキー（従来形式 + sk-proj- 新形式） ---
if echo "$CHECK_TARGET" | grep -qE "sk-proj-[a-zA-Z0-9_-]{20,}"; then
  echo '{"decision":"block","reason":"OpenAI APIキー (sk-proj-) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

if echo "$CHECK_TARGET" | grep -qE "sk-[a-zA-Z0-9]{40,}"; then
  echo '{"decision":"block","reason":"OpenAI APIキー (sk-) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- AWS アクセスキー ---
if echo "$CHECK_TARGET" | grep -qE "AKIA[0-9A-Z]{16}"; then
  echo '{"decision":"block","reason":"AWS アクセスキー (AKIA...) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- GitHub Personal Access Token ---
if echo "$CHECK_TARGET" | grep -qE "ghp_[a-zA-Z0-9]{36}"; then
  echo '{"decision":"block","reason":"GitHub PAT (ghp_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Slack Bot/User Token ---
if echo "$CHECK_TARGET" | grep -qE "xox[bpsa]-[a-zA-Z0-9-]{20,}"; then
  echo '{"decision":"block","reason":"Slack トークン (xox*) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Google APIキー ---
if echo "$CHECK_TARGET" | grep -qE "AIza[0-9A-Za-z_-]{35}"; then
  echo '{"decision":"block","reason":"Google APIキー (AIza...) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# --- Vercel Token ---
if echo "$CHECK_TARGET" | grep -qE "vl_[a-zA-Z0-9_-]{20,}"; then
  echo '{"decision":"block","reason":"Vercel トークン (vl_) の漏洩を検出しました。環境変数を使用してください。"}'
  exit 0
fi

# 全チェック通過
echo '{"decision":"approve"}'
