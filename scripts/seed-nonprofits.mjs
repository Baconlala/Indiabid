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

// Real nonprofits, national listings (no city). Domains verified via web search
// before seeding — see conversation for sources. Charitism gets the oldest
// createdHoursAgo so it naturally sorts first among these unclaimed (0-bid) entries.
const nonprofits = [
  { domain: "charitism.com", title: "Charitism", description: "E-commerce platform that lets you donate to verified charities while you shop.", createdHoursAgo: 40, clicks: 3 },
  { domain: "akshayapatra.org", title: "Akshaya Patra Foundation", description: "Nonprofit serving free midday meals to millions of government school children daily.", createdHoursAgo: 30, clicks: 2 },
  { domain: "giveindia.org", title: "GiveIndia", description: "India's largest online giving platform, connecting donors with thousands of verified NGOs.", createdHoursAgo: 26, clicks: 2 },
  { domain: "cry.org", title: "CRY - Child Rights and You", description: "Nonprofit working on child rights, protection, and access to education across India.", createdHoursAgo: 22, clicks: 1 },
  { domain: "goonj.org", title: "Goonj", description: "Nonprofit turning urban surplus material into dignity-based aid for rural communities.", createdHoursAgo: 18, clicks: 1 },
];

async function main() {
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr) throw catErr;
  const catId = cats.find((c) => c.slug === "non-profits")?.id;
  if (!catId) throw new Error("non-profits category not found — insert it first.");

  const rows = nonprofits.map((s) => {
    const url = `https://${s.domain}`;
    return {
      url,
      normalized_url: url,
      title: s.title,
      description: s.description,
      category_id: catId,
      city_id: null,
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
