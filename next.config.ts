import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Recipe photos uploaded via the admin editor are stored in Vercel Blob
    // storage (see src/app/api/admin/recipes/[id]/image/route.ts) rather
    // than under public/, so next/image needs this host allowlisted.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // The wordmark logo (login/signup pages, dashboard header) is served as
    // an SVG from public/brand/svg/. Next's image optimizer refuses to
    // process SVGs by default (XSS hardening for untrusted/user-uploaded
    // images) and returns a 400, which is why the logo wasn't rendering
    // anywhere. Safe to allow here since this is our own bundled brand
    // asset, not user-uploaded content — paired with a strict CSP on the
    // optimizer response as Next's docs recommend.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
