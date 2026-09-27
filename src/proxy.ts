import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export function proxy(...args: Parameters<typeof auth>) {
  return auth(...args);
}

export const config = {
  // Recipe photos live under public/recipe-photos and must be reachable both
  // directly and via Next's image optimizer (which fetches the local file
  // through this same middleware chain) without requiring a session.
  // Brand assets (public/brand/**: wordmark, marks, app icons) need the same
  // treatment — the wordmark logo is used on the (pre-auth) login/signup
  // pages, so gating it behind a session made the image optimizer's internal
  // fetch get 307-redirected to /login instead of the actual file, which
  // made the logo silently fail to render everywhere it's used.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|recipe-photos|brand).*)"],
};
