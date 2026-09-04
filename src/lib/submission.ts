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

/** Strips tracking params, drops the trailing slash, lowercases the hostname. */
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

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return { ok: false, reason: "Please use a real public URL, not a local address." };
  }

  if (BLOCKED_DOMAINS.has(hostname)) {
    return { ok: false, reason: "Shortened links aren't allowed — please use the direct URL." };
  }

  for (const param of TRACKING_PARAMS) {
    url.searchParams.delete(param);
  }

  url.hostname = hostname;
  url.hash = "";
  let normalized = url.toString();
  if (normalized.endsWith("/") && url.pathname === "/") {
    normalized = normalized.slice(0, -1);
  }

  return { ok: true, normalized };
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
