import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

const nextConfig: NextConfig = {
  // プロジェクトに応じて設定を追加
  // serverExternalPackages: [],
  // images: { remotePatterns: [] },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // SENTRY_AUTH_TOKEN がない環境（ローカル・CI）ではビルドを止めない
  silent: !process.env.SENTRY_AUTH_TOKEN,

  disableLogger: true,
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
})
