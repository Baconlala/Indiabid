import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();
const favicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

// Real restaurant chains, each paired with the city it actually originated in.
// Domains verified via web search before seeding — see conversation for sources.
const restaurants = [
  { domain: "barbequenation.com", title: "Barbeque Nation", description: "Multi-cuisine restaurant chain known for live grills and unlimited buffet dining.", citySlug: "bengaluru", createdHoursAgo: 30, clicks: 3 },
  { domain: "sagarratna.com", title: "Sagar Ratna", description: "South Indian vegetarian restaurant chain known for dosas, idlis, and thalis.", citySlug: "delhi", createdHoursAgo: 26, clicks: 2 },
  { domain: "wowmomo.com", title: "Wow! Momo", description: "Quick-service restaurant chain specialising in momos and Tibetan-inspired snacks.", citySlug: "kolkata", createdHoursAgo: 22, clicks: 2 },
  { domain: "mainlandchina.in", title: "Mainland China", description: "Fine-dining Chinese restaurant chain with outlets across major Indian cities.", citySlug: "mumbai", createdHoursAgo: 18, clicks: 2 },
  { domain: "paradisefoodcourt.in", title: "Paradise Biryani", description: "Iconic restaurant chain famous for Hyderabadi biryani since 1953.", citySlug: "hyderabad", createdHoursAgo: 14, clicks: 4 },
  { domain: "haldiram.com", title: "Haldiram's", description: "Restaurant and sweets chain serving Indian snacks, sweets, and thalis.", citySlug: "jaipur", createdHoursAgo: 10, clicks: 3 },
];

// Real, legitimate D2C sexual-wellness brands — national listings, no city.
// Domains verified via web search before seeding — see conversation for sources.
const adult = [
  { domain: "mymuse.in", title: "MyMuse", description: "Sexual wellness brand offering intimacy products, designed and shipped discreetly across India.", createdHoursAgo: 20, clicks: 2 },
  { domain: "boldcare.in", title: "Bold Care", description: "Men's sexual health platform offering doctor consultations, treatments, and wellness products.", createdHoursAgo: 16, clicks: 2 },
  { domain: "thatsassything.com", title: "That Sassy Thing", description: "D2C brand for intimate wellness products, focused on inclusivity and body-safe design.", createdHoursAgo: 12, clicks: 1 },
];

async function main() {
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr) throw catErr;
  const { data: cits, error: citErr } = await supabase.from("cities").select("id, slug");
  if (citErr) throw citErr;

  const catIdBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  const cityIdBySlug = Object.fromEntries(cits.map((c) => [c.slug, c.id]));

  const rows = [
    ...restaurants.map((s) => ({ ...s, categorySlug: "restaurants" })),
    ...adult.map((s) => ({ ...s, categorySlug: "adult" })),
  ].map((s) => {
    const url = `https://${s.domain}`;
    return {
      url,
      normalized_url: url,
      title: s.title,
      description: s.description,
      category_id: catIdBySlug[s.categorySlug],
      city_id: s.citySlug ? cityIdBySlug[s.citySlug] : null,
      current_bid: 0,
      is_claimed: false,
      is_locked: false,
      locked_until: null,
      favicon_url: favicon(s.domain),
      click_count: s.clicks ?? 0,
      created_at: hoursAgo(s.createdHoursAgo),
      last_bid_at: null,
      is_active: true,
      moderation_status: "approved",
    };
  });

  const { data: existing } = await supabase.from("listings").select("normalized_url");
  const existingUrls = new Set((existing ?? []).map((r) => r.normalized_url));
  const toInsert = rows.filter((r) => !existingUrls.has(r.normalized_url));

  if (toInsert.length === 0) {
    console.log("Nothing to insert — all URLs already exist.");
    return;
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("listings")
    .insert(toInsert)
    .select("id, title, created_at, normalized_url");
  if (insertErr) throw insertErr;

  console.log(`Inserted ${inserted.length} listings.`);

  const activityRows = inserted.map((row) => ({
    listing_id: row.id,
    event_type: "listing_created",
    amount: null,
    timestamp: row.created_at,
  }));

  const { error: activityErr } = await supabase.from("activity_feed").insert(activityRows);
  if (activityErr) throw activityErr;
  console.log(`Inserted ${activityRows.length} activity_feed rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
