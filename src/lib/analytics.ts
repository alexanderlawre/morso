"use client";

import posthog from "posthog-js";

// Client-side product analytics. Entirely inert unless
// NEXT_PUBLIC_POSTHOG_KEY is set — no project exists yet, so every call
// below is a safe no-op until one does. Lazily initialized on the first
// real event instead of a separate mount-time provider, since nothing here
// needs to run before that.
let initialized = false;

function ensureInit(): boolean {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;
  if (!initialized) {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      person_profiles: "identified_only",
      // We call capture() explicitly at the specific moments below instead
      // of wanting every route change auto-tracked.
      capture_pageview: false,
    });
    initialized = true;
  }
  return true;
}

export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (!ensureInit()) return;
  posthog.capture(name, properties);
}

export function identifyUser(userId: string) {
  if (!ensureInit()) return;
  posthog.identify(userId);
}
