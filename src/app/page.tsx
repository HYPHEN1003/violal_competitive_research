import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-24">
      <h1 className="text-4xl font-bold">[PROJECT_NAME]</h1>
      <p className="max-w-md text-center text-muted-foreground">
        [PROJECT_DESCRIPTION]
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">ログイン</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">新規登録</Link>
        </Button>
      </div>
    </main>
  )
}
