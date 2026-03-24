import posthog from "posthog-js"

export function initPostHog() {
  if (typeof window === "undefined") return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!key || !host) return

  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false, // Next.js App Router では手動で制御
  })
}

export { posthog }
