import type { Metadata, Viewport } from "next";
import { Poppins, STIX_Two_Text } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { AuthSessionProvider } from "@/components/session-provider";
import { AppHeader } from "@/components/app-header";
import { TimezoneSync } from "@/components/timezone-sync";
import { NativeBootstrap } from "@/components/native-bootstrap";

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
  title: "Umami",
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

  return (
    <html
      lang="en"
      className={`${poppins.variable} ${stixTwoText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#EFEFEF] text-[#101010]">
        <AuthSessionProvider session={session}>
          <NativeBootstrap />
          <TimezoneSync />
          {session?.user?.onboarded && (
            <AppHeader
              isAdmin={session.user.isAdmin}
              name={session.user.name}
              image={session.user.image}
            />
          )}
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
