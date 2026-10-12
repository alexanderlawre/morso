"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { MotionButton } from "@/components/motion-button";
import { SheetModal } from "@/components/sheet-modal";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/locales";
import { THEME_COOKIE, LOCALE_COOKIE, type ThemeMode } from "@/lib/preference-constants";

const THEMES: ThemeMode[] = ["LIGHT", "GREEN", "DARK"];

function setCookie(name: string, value: string) {
  // 1 year, readable by the server on the next request (not httpOnly —
  // this is a plain display preference, not a secret).
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

// The content shared by both places this menu appears: the standalone
// circular button on the pre-login screens (AccessibilityMenu below,
// rendered via src/app/(auth)/layout.tsx) and the row inside ProfileMenu's
// dropdown once logged in (src/components/profile-menu.tsx). Fully
// self-contained (owns its own view/theme/locale/about state) so either
// caller can just conditionally mount it — state naturally resets each
// time it mounts, since it's unmounted on close.
export function AccessibilityPanel({ onClose }: { onClose: () => void }) {
  const t = useTranslations("accessibility");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { data: session, update } = useSession();

  const [view, setView] = useState<"root" | "language" | "appearance">("root");
  const [showAbout, setShowAbout] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("LIGHT");

  // Theme has no server-side React context to read in a client component —
  // sync from the attribute the server already rendered on <html> (see
  // src/app/layout.tsx), once, on mount.
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr) setThemeState(attr.toUpperCase() as ThemeMode);
  }, []);

  async function persist(patch: { theme?: ThemeMode; locale?: Locale }) {
    if (session?.user) {
      await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).catch(() => {});
      await update(patch);
    }
    router.refresh();
  }

  function selectTheme(next: ThemeMode) {
    setThemeState(next);
    // Instant visual feedback — don't wait on the network round-trip below
    // before the page itself looks different.
    document.documentElement.setAttribute("data-theme", next.toLowerCase());
    setCookie(THEME_COOKIE, next);
    void persist({ theme: next });
  }

  function selectLocale(next: Locale) {
    setCookie(LOCALE_COOKIE, next);
    onClose();
    void persist({ locale: next });
  }

  return (
    <>
      {view === "root" && (
        <>
          <button
            onClick={() => setShowAbout(true)}
            className="block w-full px-4 py-2 text-start text-sm text-ink transition hover:bg-hover"
          >
            {t("about.label")}
          </button>
          <button
            onClick={() => setView("language")}
            className="block w-full px-4 py-2 text-start text-sm text-ink transition hover:bg-hover"
          >
            {t("language.label")}
          </button>
          <button
            onClick={() => setView("appearance")}
            className="block w-full px-4 py-2 text-start text-sm text-ink transition hover:bg-hover"
          >
            {t("appearance.label")}
          </button>
        </>
      )}

      {view === "language" && (
        <>
          <button
            onClick={() => setView("root")}
            className="block w-full px-4 py-2 text-start text-xs font-medium text-muted transition hover:bg-hover"
          >
            ← {t("back")}
          </button>
          <div className="my-1 border-t border-border" />
          <div className="max-h-64 overflow-y-auto">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => selectLocale(loc)}
                aria-current={loc === locale}
                className={`block w-full px-4 py-2 text-start text-sm transition hover:bg-hover ${
                  loc === locale ? "font-semibold text-accent" : "text-ink"
                }`}
              >
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>
        </>
      )}

      {view === "appearance" && (
        <>
          <button
            onClick={() => setView("root")}
            className="block w-full px-4 py-2 text-start text-xs font-medium text-muted transition hover:bg-hover"
          >
            ← {t("back")}
          </button>
          <div className="my-1 border-t border-border" />
          {THEMES.map((mode) => (
            <button
              key={mode}
              onClick={() => selectTheme(mode)}
              aria-current={mode === theme}
              className={`flex w-full items-center gap-2.5 px-4 py-2 text-start text-sm transition hover:bg-hover ${
                mode === theme ? "font-semibold text-accent" : "text-ink"
              }`}
            >
              <ThemeSwatch mode={mode} />
              {t(`appearance.${mode.toLowerCase() as "light" | "green" | "dark"}`)}
            </button>
          ))}
        </>
      )}

      <SheetModal open={showAbout} onClose={() => setShowAbout(false)}>
        <p className="text-lg font-bold text-ink">{t("about.label")}</p>
        <p className="mt-2 text-sm text-muted">{t("about.body")}</p>
        <button
          type="button"
          onClick={() => setShowAbout(false)}
          className="mt-5 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink shadow-brand transition hover:bg-hover"
        >
          {t("about.close")}
        </button>
      </SheetModal>
    </>
  );
}

function ThemeSwatch({ mode }: { mode: ThemeMode }) {
  const colors: Record<ThemeMode, string> = {
    LIGHT: "#EFEFEF",
    GREEN: "#0F1F17",
    DARK: "#000000",
  };
  return (
    <span
      className="h-4 w-4 shrink-0 rounded-full border border-border"
      style={{ backgroundColor: colors[mode] }}
    />
  );
}

// Plain globe glyph — language is one of the three options behind this
// button, and a neutral icon avoids a face/person silhouette.
function GlobeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
      <path d="M4.5 7.5h15" />
      <path d="M4.5 16.5h15" />
    </svg>
  );
}

// Standalone circular trigger + its own dropdown, for the pre-login screens
// (rendered once via src/app/(auth)/layout.tsx). The logged-in equivalent
// is a row inside ProfileMenu's dropdown instead — see AccessibilityPanel.
export function AccessibilityMenu() {
  const t = useTranslations("accessibility");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <MotionButton
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("trigger")}
        whileHover={{ y: -2, scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-sm"
      >
        <GlobeIcon />
      </MotionButton>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute end-0 top-11 z-20 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-lifted"
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <AccessibilityPanel onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
