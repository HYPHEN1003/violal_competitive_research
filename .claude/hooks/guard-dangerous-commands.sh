#!/bin/bash
# 破壊的・危険なコマンドを検知して警告するフック
# PreToolUse: Bash にマッチ

INPUT=$(cat)
source "$(dirname "$0")/_parse-input.sh"
COMMAND=$(_parse_field "$INPUT" "command")

# --- 破壊的 git コマンド（--force-with-lease, --force-if-includes は許可） ---
if echo "$COMMAND" | grep -qE "git\s+push\s+.*--force($|\s)" && ! echo "$COMMAND" | grep -qE "force-with-lease|force-if-includes"; then
  echo '{"decision":"block","reason":"git push --force は禁止されています。--force-with-lease を使用してください。"}'
  exit 0
fi

if echo "$COMMAND" | grep -qE "git\s+push\s+.*\s-f($|\s)" && ! echo "$COMMAND" | grep -qE "force-with-lease|force-if-includes"; then
  echo '{"decision":"block","reason":"git push -f は禁止されています。--force-with-lease を使用してください。"}'
  exit 0
fi

if echo "$COMMAND" | grep -qE "git\s+reset\s+--hard"; then
  echo '{"decision":"block","reason":"git reset --hard は禁止されています。変更を失う可能性があります。"}'
  exit 0
fi

if echo "$COMMAND" | grep -qE "git\s+clean\s+-f"; then
  echo '{"decision":"block","reason":"git clean -f は禁止されています。未追跡ファイルが削除されます。"}'
  exit 0
fi

if echo "$COMMAND" | grep -qE "git\s+branch\s+-D"; then
  echo '{"decision":"block","reason":"git branch -D は禁止されています。git branch -d（小文字）を使用してください。"}'
  exit 0
fi

# --- ファイル削除 ---
if echo "$COMMAND" | grep -qE "rm\s+-(rf|fr|r)\s"; then
  echo '{"decision":"block","reason":"rm -rf / rm -r は禁止されています。削除対象を個別に指定してください。"}'
  exit 0
fi

# --- リモートスクリプト実行 ---
if echo "$COMMAND" | grep -qE "(curl|wget).*\|\s*(sh|bash)"; then
  echo '{"decision":"block","reason":"リモートスクリプトのパイプ実行は禁止されています。スクリプトを確認してから実行してください。"}'
  exit 0
fi

# --- 危険なパーミッション変更 ---
if echo "$COMMAND" | grep -qE "chmod\s+777"; then
  echo '{"decision":"block","reason":"chmod 777 は禁止されています。最小権限のパーミッションを設定してください。"}'
  exit 0
fi

# --- シークレットの外部送信の疑い ---
if echo "$COMMAND" | grep -qE "curl.*\.(env|pem|key)" || echo "$COMMAND" | grep -qE "cat.*\.(env|pem|key).*\|.*curl"; then
  echo '{"decision":"block","reason":"機密ファイルを外部に送信しようとしています。この操作は禁止されています。"}'
  exit 0
fi

# 問題なし
echo '{"decision":"approve"}'
