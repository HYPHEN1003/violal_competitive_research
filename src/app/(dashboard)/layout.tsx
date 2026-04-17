import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { navLinks } from "@/components/nav-links"
import Link from "next/link"
import { signOut } from "./actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* デスクトップ サイドバー */}
      <aside className="hidden w-64 border-r bg-muted/40 md:block">
        <div className="flex h-14 items-center px-6 font-semibold">
          [PROJECT_NAME]
        </div>
        <Separator />
        <nav className="space-y-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-2">
            {/* モバイル: ハンバーガーメニュー */}
            <MobileSidebar />
            <h1 className="text-sm font-medium">[PROJECT_NAME]</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <form>
              <Button formAction={signOut} variant="outline" size="sm">
                ログアウト
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
