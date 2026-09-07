import { createBrowserSupabaseClient, createServiceSupabaseClient } from "./supabase";
import type { ActivityEvent, Category, City, Listing } from "./types";
import { charityAmount } from "./bidding";

export const CATEGORY_GROUPS = [
  "AI",
  "Software",
  "Growth",
  "Money",
  "Sectors",
  "People",
] as const;

type ListingRow = {
  id: string;
  url: string;
  title: string;
  description: string;
  category_id: string;
  city_id: string | null;
  current_bid: number;
  is_claimed: boolean;
  is_locked: boolean;
  locked_until: string | null;
  image_url: string | null;
  favicon_url: string | null;
  click_count: number;
  created_at: string;
  last_bid_at: string | null;
};

function mapListing(row: ListingRow): Listing {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description,
    categoryId: row.category_id,
    cityId: row.city_id,
    currentBid: row.current_bid,
    isClaimed: row.is_claimed,
    isLocked: row.is_locked,
    lockedUntil: row.locked_until,
    ownerContact: null, // never exposed by the public view
    imageUrl: row.image_url,
    faviconUrl: row.favicon_url,
    clickCount: row.click_count,
    createdAt: row.created_at,
    lastBidAt: row.last_bid_at,
    isActive: true, // the public view only ever contains active listings
  };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, group, icon, is_sensitive");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    group: r.group,
    icon: r.icon ?? "",
    isSensitive: r.is_sensitive,
  }));
}

export async function getCities(): Promise<City[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.from("cities").select("id, name, slug").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getListings(): Promise<Listing[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.from("listings_public").select("*");
  if (error) throw error;
  return (data ?? []).map(mapListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.from("listings_public").select("*").eq("id", id).maybeSingle();
  if (error) {
    // 22P02 = invalid input syntax for uuid — a malformed/stale id, treat as not found.
    if (error.code === "22P02") return null;
    throw error;
  }
  return data ? mapListing(data) : null;
}

/** Server-only: whether a listing already has an owner on file (never exposes the contact itself). */
export async function getListingOwnershipStatus(id: string): Promise<{ hasOwner: boolean } | null> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select("owner_contact")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (error.code === "22P02") return null;
    throw error;
  }
  return data ? { hasOwner: data.owner_contact != null } : null;
}

/** Server-only: looks a listing up by its magic-link dashboard token. */
export async function getListingByMagicToken(token: string): Promise<Listing | null> {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, url, title, description, category_id, city_id, current_bid, is_claimed, is_locked, locked_until, image_url, favicon_url, click_count, created_at, last_bid_at, is_active"
    )
    .eq("owner_magic_token", token)
    .eq("is_active", true)
    .maybeSingle();
  if (error) {
    if (error.code === "22P02") return null;
    throw error;
  }
  if (!data) return null;
  return {
    id: data.id,
    url: data.url,
    title: data.title,
    description: data.description,
    categoryId: data.category_id,
    cityId: data.city_id,
    currentBid: data.current_bid,
    isClaimed: data.is_claimed,
    isLocked: data.is_locked,
    lockedUntil: data.locked_until,
    ownerContact: null,
    imageUrl: data.image_url,
    faviconUrl: data.favicon_url,
    clickCount: data.click_count,
    createdAt: data.created_at,
    lastBidAt: data.last_bid_at,
    isActive: data.is_active,
  };
}

export async function getActivityFeed(limit = 50): Promise<ActivityEvent[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("activity_feed_public")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    listingId: r.listing_id,
    eventType: r.event_type,
    amount: r.amount,
    timestamp: r.timestamp,
  }));
}

/** Board = every active listing for a city (or national if cityId is null), ranked. */
export function sortBoard(listings: Listing[], cityId: string | null): Listing[] {
  return listings
    .filter((l) => l.isActive && l.cityId === cityId)
    .sort((a, b) => {
      if (b.currentBid !== a.currentBid) return b.currentBid - a.currentBid;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}

export type TrendingEntry = {
  listing: Listing;
  amountToday: number;
  eventsToday: number;
};

/** Listings ranked by rupees bid in the last 24h — a separate "what's hot right now" view, not a second ranking. */
export async function getTrendingToday(limit = 10): Promise<TrendingEntry[]> {
  const supabase = createBrowserSupabaseClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("activity_feed_public")
    .select("listing_id, amount, timestamp")
    .gte("timestamp", since);
  if (error) throw error;

  const scores = new Map<string, { amount: number; events: number }>();
  for (const row of data ?? []) {
    const cur = scores.get(row.listing_id) ?? { amount: 0, events: 0 };
    cur.amount += row.amount ?? 0;
    cur.events += 1;
    scores.set(row.listing_id, cur);
  }

  const listings = await getListings();
  const listingById = new Map(listings.map((l) => [l.id, l]));

  return [...scores.entries()]
    .map(([listingId, s]) => {
      const listing = listingById.get(listingId);
      return listing && listing.isActive
        ? { listing, amountToday: s.amount, eventsToday: s.events }
        : null;
    })
    .filter((e): e is TrendingEntry => e !== null)
    .sort((a, b) => b.amountToday - a.amountToday || b.eventsToday - a.eventsToday)
    .slice(0, limit);
}

export async function getSiteStats() {
  const listings = await getListings();
  const totalRaised = listings.reduce((sum, l) => sum + l.currentBid, 0);
  const totalListings = listings.length;
  const claimedListings = listings.filter((l) => l.isClaimed).length;
  const totalClicks = listings.reduce((sum, l) => sum + l.clickCount, 0);
  return {
    totalRaised,
    totalListings,
    claimedListings,
    totalClicks,
    charityDonated: charityAmount(totalRaised),
  };
}
