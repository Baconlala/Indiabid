const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "ref",
  "ref_src",
  "referral",
  "aff",
  "aff_id",
  "affiliate",
  "igshid",
  "si",
];

// Common URL shorteners — a shortened link hides the real destination,
// which defeats the point of a public "here's exactly where your bid goes" board.
const BLOCKED_DOMAINS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "rebrand.ly",
  "cutt.ly",
  "shorturl.at",
  "tiny.cc",
  "rb.gy",
  "s.id",
  "lnkd.in",
  "bl.ink",
  "shorte.st",
  "adf.ly",
]);

export type UrlCheckResult = { ok: true; normalized: string } | { ok: false; reason: string };

/**
 * Strips tracking params, the "www." prefix, and the trailing slash;
 * lowercases the hostname; and always normalizes to https. This is what
 * duplicate-listing detection keys off, so http vs https and www vs
 * non-www variants of the same site must resolve to the same value.
 */
export function normalizeUrl(raw: string): UrlCheckResult {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "That doesn't look like a valid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "URL must start with http:// or https://." };
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return { ok: false, reason: "Please use a real public URL, not a local address." };
  }

  if (BLOCKED_DOMAINS.has(hostname)) {
    return { ok: false, reason: "Shortened links aren't allowed. Please use the direct URL." };
  }

  for (const param of TRACKING_PARAMS) {
    url.searchParams.delete(param);
  }

  url.protocol = "https:";
  url.hostname = hostname;
  url.hash = "";
  let normalized = url.toString();
  if (normalized.endsWith("/") && url.pathname === "/") {
    normalized = normalized.slice(0, -1);
  }

  return { ok: true, normalized };
}

// Combining diacritical marks (U+0300-U+036F) left behind by NFKD normalization.
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

// Apostrophes (straight or curly) are dropped rather than treated as a word
// break, so "Haldiram's" becomes "haldirams", not the broken-looking
// "haldiram-s".
const APOSTROPHES = /['’]/g;

/** Turns a title into a URL-safe slug, e.g. "Chai & Code" -> "chai-code". */
export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(APOSTROPHES, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return base || "listing";
}

export function faviconUrl(normalizedUrl: string): string {
  const hostname = new URL(normalizedUrl).hostname;
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

const PHONE_RE = /^[6-9]\d{9}$/;

export function isValidIndianPhone(phone: string): boolean {
  return PHONE_RE.test(phone.replace(/\D/g, "").slice(-10));
}

// Two-label ccTLDs where the registrable domain needs three labels, not two
// (e.g. "acme.co.in", not just "co.in"). Not exhaustive — a real public-suffix
// list would be more correct, but this covers the common cases for an
// India-focused audience without adding a dependency for it.
const TWO_LABEL_TLDS = new Set([
  "co.in",
  "com.in",
  "net.in",
  "org.in",
  "co.uk",
  "co.nz",
  "co.jp",
  "com.au",
  "com.br",
  "co.za",
]);

/** Best-effort registrable domain, e.g. "app.khatabook.com" -> "khatabook.com". */
export function registrableDomain(hostname: string): string {
  const labels = hostname.toLowerCase().split(".");
  if (labels.length <= 2) return hostname.toLowerCase();
  const lastTwo = labels.slice(-2).join(".");
  const take = TWO_LABEL_TLDS.has(lastTwo) ? 3 : 2;
  return labels.slice(-take).join(".");
}

/** Whether an email's domain plausibly belongs to the same organisation as the listing's URL. */
export function emailMatchesListingDomain(email: string, listingUrl: string): boolean {
  const emailDomain = email.split("@")[1]?.toLowerCase().trim();
  if (!emailDomain) return false;
  let listingHost: string;
  try {
    listingHost = new URL(listingUrl).hostname;
  } catch {
    return false;
  }
  return registrableDomain(emailDomain) === registrableDomain(listingHost);
}
