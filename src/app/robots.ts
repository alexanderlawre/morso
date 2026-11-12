import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Account-only surfaces (and the API) have nothing for a crawler to
        // index — keep them out of the crawl budget.
        disallow: ["/api/", "/onboarding/", "/profile", "/settings"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
