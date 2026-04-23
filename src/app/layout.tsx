import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./_components/providers"

export const metadata: Metadata = {
  title: "VIOLAL_PROJECT",
  description: "HYPHEN Project Template",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
          <Providers>{children}</Providers>
        </body>
    </html>
  )
}
