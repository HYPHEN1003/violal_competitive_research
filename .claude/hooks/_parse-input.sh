#!/bin/bash
# 共通 JSON パーサー — jq 必須。未インストール時はブロック（フェイルクローズ）
# 全フックから source して使用する
#
# HOOK_PROFILE 設計方針:
#   standard（デフォルト）: 全フック有効。セキュリティは警告、品質は自動修正
#   strict: セキュリティフックがブロック（approve→block）に昇格
#   minimal: 品質フック（format/lint）をスキップ。セキュリティフックは常に有効
#
# セキュリティフック（guard, detect-secret, check-rls）は minimal でもスキップしない

# jq 存在チェック（フェイルクローズ）
if ! command -v jq &> /dev/null; then
  echo '{"decision":"block","reason":"jq が未インストールです。セキュリティフックが動作できません。brew install jq を実行してください。"}'
  exit 0
fi

_parse_field() {
  local input="$1"
  local field="$2"
  echo "$input" | jq -r ".tool_input.${field} // \"\"" 2>/dev/null
}

_parse_nested_field() {
  local input="$1"
  local field1="$2"
  local field2="$3"
  echo "$input" | jq -r ".tool_input.${field1} // .tool_input.${field2} // \"\"" 2>/dev/null
}
