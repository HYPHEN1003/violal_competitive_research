#!/bin/bash
# Supabaseマイグレーションファイルに CREATE TABLE があるのに
# RLS ENABLE がない場合に警告するフック
# PreToolUse: Write, Edit にマッチ
# 制限: 単一編集内のチェックのみ。複数編集に分割された場合は検出できない。

# フックプロファイル対応（セキュリティフックは minimal でもスキップしない）
PROFILE="${HOOK_PROFILE:-standard}"

INPUT=$(cat)
source "$(dirname "$0")/_parse-input.sh"

# ファイルパスを取得
FILE_PATH=$(_parse_field "$INPUT" "file_path")

# supabase/migrations/ 以外は無視
if ! echo "$FILE_PATH" | grep -q "supabase/migrations/"; then
  echo '{"decision":"approve"}'
  exit 0
fi

# 書き込み内容を取得
CONTENT=$(_parse_nested_field "$INPUT" "content" "new_string")

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
