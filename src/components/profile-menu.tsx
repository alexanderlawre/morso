"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { getInitials } from "@/lib/avatar";
import { MotionButton } from "@/components/motion-button";
import { HowItWorksModal } from "@/components/how-it-works-modal";
import { AccessibilityPanel } from "@/components/accessibility-menu";
import { SheetModal } from "@/components/sheet-modal";

export function ProfileMenu({
  name,
  image,
  isAdmin,
}: {
  name?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}) {
  const t = useTranslations("accessibility");
  const [open, setOpen] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
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
        aria-label="Profile menu"
        whileHover={{ y: -2, scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-accent-ink shadow-sm"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </MotionButton>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute end-0 top-11 z-20 w-48 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-lifted"
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
          >
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink transition hover:bg-hover"
            >
              Profile
            </Link>
            <Link
              href="/cook-later"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink transition hover:bg-hover"
            >
              Cook later
            </Link>
            {/* Accessibility/appearance/language — deliberately placed above
                Personalization (this app's de-facto "Settings" entry; there's
                no separate literal Settings row). */}
            <button
              onClick={() => {
                setShowAccessibility(true);
                setOpen(false);
              }}
              className="block w-full px-4 py-2 text-start text-sm text-ink transition hover:bg-hover"
            >
              {t("menuLabel")}
            </button>
            <Link
              href="/settings/personalization"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink transition hover:bg-hover"
            >
              Personalization
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-ink transition hover:bg-hover"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => {
                setShowHowItWorks(true);
                setOpen(false);
              }}
              className="block w-full px-4 py-2 text-start text-sm text-ink transition hover:bg-hover"
            >
              How Morso works
            </button>
            <div className="my-1.5 border-t border-border" />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="block w-full px-4 py-2 text-start text-sm text-ink transition hover:bg-hover"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <HowItWorksModal open={showHowItWorks} onClose={() => setShowHowItWorks(false)} />

      <SheetModal open={showAccessibility} onClose={() => setShowAccessibility(false)}>
        <AccessibilityPanel onClose={() => setShowAccessibility(false)} />
      </SheetModal>
    </div>
  );
}
