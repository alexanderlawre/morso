import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no providers that touch Prisma/bcrypt here, so this file
// can be imported from middleware. The Credentials provider (which does need
// Node APIs) is added on top of this in src/auth.ts for server-side routes.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isPublicRoute =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname.startsWith("/api/signup") ||
        pathname.startsWith("/api/account/forgot-password") ||
        pathname.startsWith("/api/account/reset-password") ||
        pathname.startsWith("/api/auth") ||
        // Guest browsing: the root redirector, the dashboard, recipe detail
        // pages, and the refresh endpoint they call are viewable without an
        // account (see getGuestDailySelection/refreshGuestDailySelection in
        // select-daily.ts). Every account-only route/API stays gated
        // exactly as before.
        pathname === "/" ||
        pathname === "/dashboard" ||
        pathname.startsWith("/recipe/") ||
        pathname === "/api/dashboard/refresh" ||
        // Legal pages, and the crawler/PWA metadata files Next's app-router
        // special-file convention serves at these exact paths — all must be
        // reachable by a logged-out visitor (and by Google, which never has
        // a session) or they 307 to /login instead of rendering.
        pathname === "/privacy" ||
        pathname === "/terms" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml" ||
        pathname === "/manifest.webmanifest";

      if (isPublicRoute) return true;

      // A path that doesn't match any real route at all (typo, dead link,
      // bot probe) can't reach anything behind the gate either way — there's
      // no page.tsx for it — so let it through instead of bouncing to
      // /login. Next's router then renders the real not-found.tsx 404, which
      // is both correct for a crawler and friendlier for a person who
      // followed a bad link.
      const knownRoutePrefixes = [
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/dashboard",
        "/onboarding",
        "/admin",
        "/api",
        "/cook-later",
        "/profile",
        "/recipe",
        "/settings",
        "/submit-recipe",
        "/privacy",
        "/terms",
      ];
      const isKnownRoute =
        pathname === "/" || knownRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
      if (!isKnownRoute) return true;

      if (!isLoggedIn) return false;

      const needsOnboarding =
        !pathname.startsWith("/onboarding") && !pathname.startsWith("/api/onboarding");
      if (!auth?.user.onboarded && needsOnboarding) {
        return Response.redirect(new URL("/onboarding/preferences", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = (user as { image?: string | null }).image ?? null;
        token.onboarded = (user as { onboarded?: boolean }).onboarded ?? false;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
        token.isPremium = (user as { isPremium?: boolean }).isPremium ?? false;
        token.theme = (user as { theme?: "LIGHT" | "GREEN" | "DARK" }).theme ?? "LIGHT";
        token.locale = (user as { locale?: string }).locale ?? "en";
      }
      if (trigger === "update" && session?.onboarded) {
        token.onboarded = true;
      }
      if (trigger === "update" && typeof session?.image !== "undefined") {
        token.picture = session.image;
      }
      // Pushed by the accessibility menu's theme/language picker (via
      // next-auth's client-side `update()`) right after the preferences
      // route persists the change, so the new value is reflected without
      // waiting for the session to naturally re-fetch.
      if (trigger === "update" && typeof session?.theme !== "undefined") {
        token.theme = session.theme;
      }
      if (trigger === "update" && typeof session?.locale !== "undefined") {
        token.locale = session.locale;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = (token.picture as string | null) ?? null;
        session.user.onboarded = token.onboarded as boolean;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isPremium = token.isPremium as boolean;
        session.user.theme = token.theme as "LIGHT" | "GREEN" | "DARK";
        session.user.locale = token.locale as string;
      }
      return session;
    },
  },
  providers: [], // populated in src/auth.ts
};
