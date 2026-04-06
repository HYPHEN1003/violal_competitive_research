"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { initPostHog, posthog } from "@/lib/posthog"

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      const search = searchParams?.toString()
      if (search) {
        url = url + "?" + search
      }
      posthog.capture("$pageview", { $current_url: url })
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    initPostHog()
  }, [])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}
