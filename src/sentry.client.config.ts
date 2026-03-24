import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // パフォーマンス監視（本番では調整）
  tracesSampleRate: 1.0,

  // セッションリプレイ（本番では調整）
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 開発環境では無効化
  enabled: process.env.NODE_ENV === "production",
})
