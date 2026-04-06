import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">ダッシュボード</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>総ユーザー数</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">実装してください</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>今月の売上</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">実装してください</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>アクティブ率</CardDescription>
            <CardTitle className="text-3xl">--</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">実装してください</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>はじめに</CardTitle>
          <CardDescription>
            このダッシュボードはテンプレートです。プロジェクトに合わせてカスタマイズしてください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. CLAUDE.md のプレースホルダーを埋める（/spec-project で壁打ち）</p>
          <p>2. Supabase でテーブルを設計する（db-architect エージェント）</p>
          <p>3. このダッシュボードにデータを接続する</p>
        </CardContent>
      </Card>
    </div>
  )
}
