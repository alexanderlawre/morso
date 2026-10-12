// Plain constants shared by both client and server code. Kept separate from
// src/lib/preference-cookies.ts (which imports "next/headers" and is
// server-only) so client components — e.g. accessibility-menu.tsx — can use
// these cookie names/types without accidentally pulling a server-only
// import into the client bundle.
export const THEME_COOKIE = "theme";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export type ThemeMode = "LIGHT" | "GREEN" | "DARK";

const THEMES: readonly ThemeMode[] = ["LIGHT", "GREEN", "DARK"];

export function isThemeMode(value: string): value is ThemeMode {
  return (THEMES as readonly string[]).includes(value);
}
