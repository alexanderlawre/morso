import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      onboarded: boolean;
      isAdmin: boolean;
      isPremium: boolean;
      // Accessibility-menu preferences (theme/locale), carried on the
      // session like isAdmin/isPremium so server code (e.g.
      // src/i18n/request.ts) can resolve them without an extra DB query
      // per request. "LIGHT"/"GREEN"/"DARK" mirrors the Prisma ThemeMode
      // enum as a plain string here to avoid importing @prisma/client types
      // into next-auth's type augmentation.
      theme: "LIGHT" | "GREEN" | "DARK";
      locale: string;
    } & DefaultSession["user"];
  }

  interface User {
    onboarded?: boolean;
    isAdmin?: boolean;
    isPremium?: boolean;
    theme?: "LIGHT" | "GREEN" | "DARK";
    locale?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    onboarded: boolean;
    isAdmin: boolean;
    isPremium: boolean;
    theme: "LIGHT" | "GREEN" | "DARK";
    locale: string;
  }
}
