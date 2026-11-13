// Next's client instrumentation entrypoint (loaded before the app's own
// client code on every page). Entirely inert unless NEXT_PUBLIC_SENTRY_DSN
// is set — client code can only read NEXT_PUBLIC_-prefixed env vars, so
// this is the one place the plain SENTRY_DSN naming doesn't carry over.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  });
}
