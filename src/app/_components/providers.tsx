"use client"

import { Suspense } from "react"
import { PostHogProviderWrapper } from "./posthog-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PostHogProviderWrapper>{children}</PostHogProviderWrapper>
    </Suspense>
  )
}
