// The 13 languages offered in the accessibility menu's language picker.
// Codes are BCP-47-ish: `zh` is Mandarin (Simplified script), `yue` is
// Cantonese (Traditional script, matching Hong Kong convention) — the two
// are mutually unintelligible spoken languages sharing a family, so they're
// listed as separate options rather than one "Chinese" entry.
export const LOCALES = [
  "en",
  "es",
  "fr",
  "zh",
  "yue",
  "ar",
  "de",
  "pt",
  "ru",
  "ja",
  "ko",
  "ur",
  "hi",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

// Each language's own name, in its own script — shown in the picker instead
// of (or alongside) the English name, so a speaker of that language can
// find it without reading English first.
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文（普通话）",
  yue: "粵語",
  ar: "العربية",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어",
  ur: "اردو",
  hi: "हिन्दी",
};

// Arabic and Urdu are the only two offered languages read right-to-left.
const RTL_LOCALES = new Set<Locale>(["ar", "ur"]);

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.has(locale as Locale);
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
