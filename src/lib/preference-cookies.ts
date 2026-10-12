import { cookies } from "next/headers";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/locales";
import { THEME_COOKIE, LOCALE_COOKIE, isThemeMode, type ThemeMode } from "@/lib/preference-constants";

export { THEME_COOKIE, LOCALE_COOKIE };
export type { ThemeMode };

// Reads the theme/language cookies the accessibility menu sets for
// logged-out visitors, before there's an account to own the preference.
// Used once, at the moment a brand-new UserPreferences row is created (end
// of onboarding — see src/app/api/onboarding/route.ts), to carry a guest's
// choice into their new account instead of silently resetting it to the
// bare defaults. Server-only (next/headers) — client code should import
// the plain constants/types from src/lib/preference-constants.ts instead.
export async function readPreferenceCookies(): Promise<{
  theme: ThemeMode;
  locale: Locale;
}> {
  const store = await cookies();
  const themeCookie = store.get(THEME_COOKIE)?.value ?? "";
  const localeCookie = store.get(LOCALE_COOKIE)?.value ?? "";

  return {
    theme: isThemeMode(themeCookie) ? themeCookie : "LIGHT",
    locale: isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE,
  };
}
