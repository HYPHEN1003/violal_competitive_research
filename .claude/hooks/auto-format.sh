#!/bin/bash
# ファイル編集後に自動でPrettierフォーマットを実行
# PostToolUse: Write|Edit にマッチ

# minimal プロファイルでは品質フックをスキップ
if [ "${HOOK_PROFILE:-standard}" = "minimal" ]; then
  exit 0
fi

INPUT=$(cat)
source "$(dirname "$0")/_parse-input.sh"
FILE_PATH=$(_parse_field "$INPUT" "file_path")

# ファイルパスがなければスキップ
if [ -z "$FILE_PATH" ] || [ "$FILE_PATH" = "null" ]; then
  exit 0
fi

# 対象拡張子のみフォーマット
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md|*.html)
    npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
