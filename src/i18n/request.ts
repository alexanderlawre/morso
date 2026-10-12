import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";
import { LOCALE_COOKIE } from "@/lib/preference-cookies";

// No URL path-prefixing (no /en/, /es/ segments) — this app's routes, the
// proxy middleware (src/proxy.ts), and the auth route-gating (src/auth.config.ts)
// all assume unprefixed paths, and restructuring every route under a
// [locale] segment would be a much larger, riskier change than this feature
// needs. Locale instead comes from (in priority order): the logged-in
// user's saved UserPreferences.locale (carried on the session — see
// src/auth.config.ts's jwt/session callbacks), then a NEXT_LOCALE cookie
// set directly by the accessibility menu for logged-out visitors, then the
// default.
export default getRequestConfig(async () => {
  const session = await auth();
  const sessionLocale = session?.user?.locale;

  let locale = DEFAULT_LOCALE;
  if (sessionLocale && isLocale(sessionLocale)) {
    locale = sessionLocale;
  } else {
    const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
    if (cookieLocale && isLocale(cookieLocale)) {
      locale = cookieLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
