/**
 * AI API 呼び出しのサンプルテンプレート
 *
 * プロンプトインジェクション対策を組み込んだ安全な呼び出しパターン。
 * プロジェクトの要件に合わせてカスタマイズすること。
 */

import { z } from "zod"

// --- 入力サニタイズ ---

const MAX_INPUT_LENGTH = 2000

/**
 * ユーザー由来テキストのサニタイズ
 * - 長さ制限
 * - 制御文字の除去
 */
export function sanitizeUserInput(input: string): string {
  return input
    .slice(0, MAX_INPUT_LENGTH)
    .replace(/[\x00-\x1F\x7F]/g, "") // 制御文字除去
    .trim()
}

// --- 出力バリデーション ---

/**
 * AI応答にシークレットが含まれていないか検証
 */
const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/, // APIキー
  /eyJ[a-zA-Z0-9_-]{10,}\.eyJ/, // JWT
  /postgres(ql)?:\/\/[^\s]+/, // DB接続文字列
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/, // 秘密鍵
]

export function containsSecrets(text: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(text))
}

// --- 安全な呼び出しパターン ---

/**
 * AI応答の構造化出力をZodでパースするヘルパー
 *
 * @example
 * const SummarySchema = z.object({
 *   title: z.string(),
 *   points: z.array(z.string()),
 * })
 *
 * const result = parseAIResponse(aiResponseText, SummarySchema)
 */
export function parseAIResponse<T>(
  responseText: string,
  schema: z.ZodType<T>,
): { success: true; data: T } | { success: false; error: string } {
  // シークレット漏洩チェック
  if (containsSecrets(responseText)) {
    return { success: false, error: "AI応答にシークレット情報が検出されました" }
  }

  // JSON抽出（AIが ```json ... ``` で返す場合の対応）
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)```/)
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : responseText.trim()

  try {
    const parsed = JSON.parse(jsonStr)
    const validated = schema.safeParse(parsed)
    if (validated.success) {
      return { success: true, data: validated.data }
    }
    return { success: false, error: validated.error.message }
  } catch {
    return { success: false, error: "AI応答のJSONパースに失敗しました" }
  }
}
