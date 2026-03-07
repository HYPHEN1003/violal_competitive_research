// プロジェクト共通の型定義
// Supabase の型は `npx supabase gen types typescript` で生成して database.ts に配置

export type SiteConfig = {
  name: string
  description: string
  url: string
}
