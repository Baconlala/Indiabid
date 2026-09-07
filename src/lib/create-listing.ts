import { createServiceSupabaseClient } from "./supabase";
import { faviconUrl, normalizeUrl, slugify } from "./submission";

const RATE_LIMIT_WINDOW_HOURS = 1;
const MAX_PER_IP_PER_WINDOW = 5;
const MAX_PER_PHONE_PER_DAY = 3;

/** Appends -2, -3, ... to baseSlug until it doesn't collide with an active listing. */
async function uniqueSlug(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  baseSlug: string
): Promise<string> {
  const { data: taken } = await supabase
    .from("listings")
    .select("slug")
    .eq("is_active", true)
    .like("slug", `${baseSlug}%`);
  const takenSlugs = new Set((taken ?? []).map((r) => r.slug));
  if (!takenSlugs.has(baseSlug)) return baseSlug;
  let n = 2;
  while (takenSlugs.has(`${baseSlug}-${n}`)) n++;
  return `${baseSlug}-${n}`;
}

export type CreateListingInput = {
  url: string;
  title: string;
  description: string;
  categoryId: string;
  cityId: string | null;
  phone: string;
  submitterIp: string;
  screenshot?: { path: string; publicUrl: string } | null;
};

export type CreateListingResult =
  | { status: "created"; listingId: string; slug: string; pendingReview: boolean }
  | { status: "duplicate"; existingListingId: string; existingSlug: string; existingTitle: string }
  | { status: "rate_limited"; reason: string }
  | { status: "error"; message: string };

export async function createListing(input: CreateListingInput): Promise<CreateListingResult> {
  const supabase = createServiceSupabaseClient();

  const normalized = normalizeUrl(input.url);
  if (!normalized.ok) {
    return { status: "error", message: normalized.reason };
  }
  const url = normalized.normalized;

  // Dedupe: same URL can't be listed twice.
  const { data: existing } = await supabase
    .from("listings")
    .select("id, slug, title")
    .eq("normalized_url", url)
    .eq("is_active", true)
    .maybeSingle();
  if (existing) {
    return {
      status: "duplicate",
      existingListingId: existing.id,
      existingSlug: existing.slug,
      existingTitle: existing.title,
    };
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
  const { count: ipCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("submitter_ip", input.submitterIp)
    .gte("created_at", windowStart);
  if ((ipCount ?? 0) >= MAX_PER_IP_PER_WINDOW) {
    return { status: "rate_limited", reason: "Too many submissions from this connection. Try again later." };
  }

  const dayStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: phoneCount } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("submitter_phone", input.phone)
    .gte("created_at", dayStart);
  if ((phoneCount ?? 0) >= MAX_PER_PHONE_PER_DAY) {
    return { status: "rate_limited", reason: "Too many submissions from this phone number today." };
  }

  const { data: category, error: categoryErr } = await supabase
    .from("categories")
    .select("id, is_sensitive")
    .eq("id", input.categoryId)
    .maybeSingle();
  if (categoryErr || !category) {
    return { status: "error", message: "Invalid category." };
  }

  const moderationStatus = category.is_sensitive ? "pending" : "approved";
  const slug = await uniqueSlug(supabase, slugify(input.title));

  const { data: inserted, error: insertErr } = await supabase
    .from("listings")
    .insert({
      url,
      normalized_url: url,
      title: input.title.trim(),
      description: input.description.trim(),
      category_id: input.categoryId,
      city_id: input.cityId,
      favicon_url: faviconUrl(url),
      image_url: input.screenshot?.publicUrl ?? null,
      submitter_ip: input.submitterIp,
      submitter_phone: input.phone,
      moderation_status: moderationStatus,
      is_active: true,
      is_claimed: false,
      current_bid: 0,
      slug,
    })
    .select("id, slug")
    .single();

  if (insertErr || !inserted) {
    return { status: "error", message: "Could not save your listing. Please try again." };
  }

  if (moderationStatus === "approved") {
    await supabase.from("activity_feed").insert({
      listing_id: inserted.id,
      event_type: "listing_created",
      amount: null,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    status: "created",
    listingId: inserted.id,
    slug: inserted.slug,
    pendingReview: moderationStatus === "pending",
  };
}
