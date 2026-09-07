import type { Listing } from "./types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.lol";

/** A ranked board (homepage, category page, etc.) as an ItemList, position = actual rank. */
export function itemListSchema(listings: Listing[], name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/listing/${l.slug}`,
      name: l.title,
    })),
  };
}

export function organizationSchema(listing: Listing) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: listing.title,
    url: listing.url,
    description: listing.description,
    ...(listing.faviconUrl ? { logo: listing.faviconUrl } : {}),
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
