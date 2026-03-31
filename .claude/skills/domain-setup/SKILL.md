---
name: domain-setup
description: Cloudflare + Vercelドメイン設定。「ドメイン」「DNS」「Cloudflare」「SSL」「Turnstile」と言われた時に使用。
---

# Cloudflare + Vercel ドメイン設定

ドメイン購入からSSL・WAF・Turnstile設定までの完全手順。

## 設定順序

```
1. Cloudflare Registrar でドメイン購入
   ↓
2. Cloudflare DNS 設定
   ↓
3. Vercel にドメイン接続
   ↓
4. SSL/TLS 設定
   ↓
5. WAF / Turnstile 設定
```

## Step 1: Cloudflare Registrar

Cloudflare でドメインを購入（原価で提供、最安）。

## Step 2: DNS 設定

Cloudflare DNS で CNAME レコードを追加:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | @ | `cname.vercel-dns.com` | Proxied |
| CNAME | www | `cname.vercel-dns.com` | Proxied |

## Step 3: Vercel にドメイン接続

Vercel ダッシュボード → Settings → Domains でドメインを追加。
SSL 証明書が自動発行されることを確認。

## Step 4: SSL/TLS 設定

**必ず "Full (strict)" に設定する。**

| 設定 | 説明 | 安全性 |
|------|------|--------|
| Flexible | Cloudflare→Origin が HTTP | 危険 |
| Full | 証明書検証なし | 非推奨 |
| **Full (strict)** | 証明書を検証 | **推奨** |

"Full" では証明書が検証されないため、中間者攻撃のリスクがある。

## Step 5: WAF / Turnstile

### WAF（Web Application Firewall）
- Cloudflare ダッシュボード → Security → WAF
- 基本ルールセットを有効化

### Turnstile（CAPTCHA 代替）
- Cloudflare ダッシュボード → Turnstile → サイトを追加
- **重要**: ホスト名にカスタムドメインを追加する（忘れやすい！）
  - `example.com` だけでなく `www.example.com` も追加
  - Vercel のプレビュー URL も必要なら追加

## トラブルシューティング

- **SSL エラー (ERR_SSL_VERSION_OR_CIPHER_MISMATCH)**: SSL/TLS が "Full (strict)" になっているか確認
- **リダイレクトループ**: Cloudflare の "Always Use HTTPS" と Vercel の設定が競合していないか確認
- **Turnstile が動かない**: ホスト名にカスタムドメインが追加されているか確認
