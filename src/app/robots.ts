import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.lol";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Owner dashboards are reachable only via an unguessable magic-link
      // token — nothing there should ever be crawled or show up in search.
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
