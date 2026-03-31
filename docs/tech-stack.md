# 技術スタック設計書

## 選定理由

| 技術 | 選定理由 |
|------|---------|
| Next.js 16 (App Router) | [例: Server Components によるパフォーマンス最適化、Vercel との親和性] |
| Tailwind CSS + shadcn/ui | [例: ユーティリティファーストで高速UI開発、カスタマイズ性が高い] |
| Supabase | [例: PostgreSQL + Auth + Storage + Realtime を一括提供、RLS でセキュリティ担保] |
| Stripe | [例: 業界標準の決済基盤、従量課金で初期コストゼロ] |
| Claude API / Amazon Bedrock | [例: 高品質な日本語対応、JP推論プロファイルで国内完結] |
| Llama Cloud (LlamaParse + LlamaIndex) | [例: PDF解析・RAGパイプライン、ドキュメント処理の標準化] |
| Vercel | [例: Next.js 公式ホスティング、Preview URL で即座にレビュー可能] |
| Sentry | [例: リアルタイムエラー監視、ソースマップ対応] |
| PostHog | [例: プロダクトアナリティクス、ファネル分析、セッションリプレイ] |
| Cloudflare | [例: 無料でDNS / CDN / WAF / Rate Limiting、DDoS対策] |

## コスト試算（MVP期間）

| サービス | プラン | 月額 | 備考 |
|---------|--------|------|------|
| Vercel | Hobby → Pro | $0 → $20 | MVP期間はHobby無料 |
| Supabase | Free → Pro | $0 → $25 | Auth・Storage・Realtime含む |
| Claude API | 従量 | $5〜20 | 月間リクエスト数による |
| Stripe | 従量 | 3.6%/件 | 固定費ゼロ |
| Sentry | Free | $0 | 5,000エラー/月まで無料 |
| PostHog | Free | $0 | 月100万イベントまで無料 |
| Cloudflare | Free | $0 | DNS/CDN/WAF/Rate Limiting |
| **合計(MVP)** | | **$5〜20/月** | |

## インフラ構成図

```
[ユーザー]
    ↓ HTTPS
[Cloudflare] → CDN / WAF / Rate Limiting
    ↓
[Vercel] → Next.js (SSR / ISR / API Routes)
    ↓
[Supabase] → PostgreSQL / Auth / Storage / Realtime
    ↓
[Stripe] → 決済処理（Webhook経由）
```
