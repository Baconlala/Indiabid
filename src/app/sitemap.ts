import type { MetadataRoute } from "next";
import { getCategories, getListings } from "@/lib/data";

// Listings and category rankings change constantly — keep the sitemap fresh
// rather than baking it in at build time.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.lol";
  const [categories, listings] = await Promise.all([getCategories(), getListings()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/local`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/daily`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${siteUrl}/submit`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/legal/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/rules`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/legal/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/legal/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories
    // Sensitive categories other than Adult have no public page to index.
    .filter((c) => !c.isSensitive || c.slug === "adult")
    .map((c) => ({
      url: `${siteUrl}/category/${c.slug}`,
      changeFrequency: "hourly",
      priority: 0.7,
    }));

  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${siteUrl}/listing/${l.slug}`,
    lastModified: l.lastBidAt ?? l.createdAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...listingPages];
}
