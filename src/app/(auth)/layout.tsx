import { AccessibilityMenu } from "@/components/accessibility-menu";

// Shared chrome for the four pre-login screens (login, signup,
// forgot-password, reset-password): just the accessibility circle
// (About/Language/Appearance), fixed in the corner so it doesn't duplicate
// across each page. `end-4` instead of `right-4` so it mirrors to the
// opposite corner automatically for RTL locales (dir="rtl" on <html>, set
// in src/app/layout.tsx).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-4 end-4 z-30">
        <AccessibilityMenu />
      </div>
      {children}
    </>
  );
}
