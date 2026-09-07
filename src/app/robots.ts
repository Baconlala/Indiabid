import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.lol";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Owner dashboards are reachable only via an unguessable magic-link
      // token — nothing there should ever be crawled or show up in search.
      // /admin is the private blog CMS, login-gated but no reason to invite crawlers.
      disallow: ["/dashboard/", "/api/", "/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
