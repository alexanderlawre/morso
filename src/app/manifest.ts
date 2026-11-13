import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Morso",
    short_name: "Morso",
    description: "Recipes picked for your diet and taste, one meal at a time.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#efefef",
    theme_color: "#1b4332",
    icons: [
      { src: "/brand/png/app-icon-light-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/png/app-icon-light-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/png/app-icon-light-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
  };
}
