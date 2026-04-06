#!/bin/bash
# PR作成前にテストが全パスしているか確認
# PreToolUse: Bash にマッチ、if: "Bash(gh pr create *)"

INPUT=$(cat)
source "$(dirname "$0")/_parse-input.sh"
COMMAND=$(_parse_field "$INPUT" "command")

# gh pr create 以外は無視
if ! echo "$COMMAND" | grep -q "gh pr create"; then
  echo '{"decision":"approve"}'
  exit 0
fi

# テスト実行
cd src 2>/dev/null
if npm run test:run --silent 2>&1; then
  echo '{"decision":"approve"}'
else
  echo '{"decision":"block","reason":"テストが失敗しています。全テストをパスしてからPRを作成してください。"}'
fi
exit 0
