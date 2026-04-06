#!/bin/bash
# ファイル編集後に自動でESLint修正を実行
# PostToolUse: Write|Edit にマッチ（auto-formatの後に実行）

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

# TypeScript/JavaScript ファイルのみlint
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    npx eslint --fix "$FILE_PATH" 2>&1 | tail -5
    ;;
esac

exit 0
