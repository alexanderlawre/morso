import type { Metadata, Viewport } from "next";
import { Poppins, STIX_Two_Text } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import "./globals.css";
import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/session-provider";
import { AppHeader } from "@/components/app-header";
import { TimezoneSync } from "@/components/timezone-sync";
import { NativeBootstrap } from "@/components/native-bootstrap";
import { isRtlLocale } from "@/i18n/locales";
import { THEME_COOKIE } from "@/lib/preference-cookies";

// Body copy app-wide. Weight scale: 200 ExtraLight (subtext — metadata,
// small labels), 400 Regular (body paragraphs), 500 Medium (tags/chip
// callouts), 600 SemiBold (emphasized inline data — nutrition numbers,
// stat figures — not structural headings), 700 Bold (subheaders — in-
// content section labels like "Ingredients"/"Method"; true page/recipe
// titles use the separate serif --font-title instead). All five loaded
// as real cuts so nothing gets browser-synthesized.
const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["200", "400", "500", "600", "700"],
});

// Page titles/section headers (h1-h3) app-wide. Bold only — headers are
// always rendered bold regardless of each heading's own font-*
// utility class (see the base-layer h1/h2/h3 rule in globals.css).
const stixTwoText = STIX_Two_Text({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Morso",
  description: "Four recipes. That's the whole surface.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  // Theme: logged-in users' saved choice wins (carried on the session, see
  // auth.config.ts); logged-out visitors get whatever the accessibility
  // menu last set via a plain cookie, so the choice still "sticks" before
  // there's an account to own it (see src/lib/preference-cookies.ts).
  const theme = session?.user?.theme ?? (await cookies()).get(THEME_COOKIE)?.value ?? "LIGHT";
  const dataTheme = theme.toLowerCase();

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={dataTheme}
      className={`${poppins.variable} ${stixTwoText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-page text-ink">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthSessionProvider session={session}>
            <NativeBootstrap />
            <TimezoneSync />
            {/* Hidden only for the genuine "logged in but mid-onboarding"
                case (unchanged from before) — guests (no session at all)
                now see the header too, with a Log in/Sign up variant
                instead of the account menu. */}
            {(!session?.user || session.user.onboarded) && (
              <AppHeader
                isAdmin={session?.user?.isAdmin}
                name={session?.user?.name}
                image={session?.user?.image}
                isGuest={!session?.user}
              />
            )}
            {children}
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
