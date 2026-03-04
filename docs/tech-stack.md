# 技術スタック設計書

## 選定理由
[CLAUDE.mdの技術スタック各項目の選定理由]

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
[構築フェーズで作成]
