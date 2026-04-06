#!/bin/bash
# PR作成コマンド実行時にMCOレビューのリマインドを表示するフック
# PreToolUse: Bash(gh pr create *) にマッチ

INPUT=$(cat)
source "$(dirname "$0")/_parse-input.sh"
COMMAND=$(_parse_field "$INPUT" "command")

# gh pr create を検出
if echo "$COMMAND" | grep -q "gh pr create"; then
  # 直近のレビュー結果があるか確認
  BRANCH=$(git branch --show-current 2>/dev/null)
  TODAY=$(date +%Y-%m-%d)
  REVIEW_FILE="docs/reviews/${TODAY}-${BRANCH}.md"

  if [ -f "$REVIEW_FILE" ]; then
    echo '{"decision":"approve","reason":"MCOレビュー実行済み（'"$REVIEW_FILE"'）"}'
  else
    echo '{"decision":"approve","reason":"MCOレビューがまだ実行されていません。PR前に /pre-pr-review の実行を推奨します。"}'
  fi
else
  echo '{"decision":"approve"}'
fi
