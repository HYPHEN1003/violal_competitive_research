#!/bin/bash
# 全Bashコマンドをタイムスタンプ付きでログに記録
# PreToolUse: Bash にマッチ

INPUT=$(cat)
source "$(dirname "$0")/_parse-input.sh"
COMMAND=$(_parse_field "$INPUT" "command")

# ログディレクトリ確認
mkdir -p .claude/logs

# タイムスタンプ付きで記録
printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$COMMAND" >> .claude/logs/command-log.txt

echo '{"decision":"approve"}'
