import type { MetadataRoute } from "next";

// Seeker-facing pages are public; the professional tool, the admin module and
// the API are never indexed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/professional", "/admin", "/api/"],
      },
    ],
  };
}
