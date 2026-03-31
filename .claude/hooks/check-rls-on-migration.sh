#!/bin/bash
# Supabaseマイグレーションファイルに CREATE TABLE があるのに
# RLS ENABLE がない場合に警告するフック
# PreToolUse: Write, Edit にマッチ
# 依存: jq（未インストール時はapproveにフォールバック）
# 制限: 単一編集内のチェックのみ。複数編集に分割された場合は検出できない。

# jq 存在チェック
if ! command -v jq &> /dev/null; then
  echo '{"decision":"approve","message":"警告: jqが未インストールのため、RLSチェックをスキップしました。brew install jq を推奨。"}'
  exit 0
fi

# フックプロファイル対応
PROFILE="${HOOK_PROFILE:-standard}"
if [ "$PROFILE" = "minimal" ]; then
  echo '{"decision":"approve"}'
  exit 0
fi

INPUT=$(cat)

# ファイルパスを取得
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""' 2>/dev/null)

# supabase/migrations/ 以外は無視
if ! echo "$FILE_PATH" | grep -q "supabase/migrations/"; then
  echo '{"decision":"approve"}'
  exit 0
fi

# 書き込み内容を取得
CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // ""' 2>/dev/null)

# CREATE TABLE があるか
if echo "$CONTENT" | grep -qiE "CREATE\s+TABLE"; then
  # ENABLE ROW LEVEL SECURITY があるか
  if ! echo "$CONTENT" | grep -qiE "ENABLE\s+ROW\s+LEVEL\s+SECURITY"; then
    if [ "$PROFILE" = "strict" ]; then
      echo '{"decision":"block","reason":"CREATE TABLE に対する ENABLE ROW LEVEL SECURITY が見つかりません。RLSポリシーを追加してください。"}'
    else
      echo '{"decision":"approve","message":"警告: CREATE TABLE に対する ENABLE ROW LEVEL SECURITY が見つかりません。RLSポリシーの追加を検討してください。"}'
    fi
    exit 0
  fi
fi

echo '{"decision":"approve"}'
