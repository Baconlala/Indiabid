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

const categorySlugById = {
  "cat-ai-tools": "ai-tools",
  "cat-ai-agents": "ai-agents",
  "cat-ai-design": "ai-design",
  "cat-saas": "saas",
  "cat-dev-tools": "dev-tools",
  "cat-mobile-apps": "mobile-apps",
  "cat-marketing": "marketing",
  "cat-seo": "seo-tools",
  "cat-communities": "communities",
  "cat-fintech": "fintech",
  "cat-investing": "investing",
  "cat-crypto": "crypto",
  "cat-ecommerce": "ecommerce",
  "cat-real-estate": "real-estate",
  "cat-healthcare": "healthcare",
  "cat-education": "education",
  "cat-creators": "creators",
  "cat-freelancers": "freelancers",
  "cat-coaches": "coaches",
};
const citySlugById = { "city-mumbai": "mumbai" };

// Additional real, lesser-known companies — not yet in the DB (only ever made it into mock data).
const moreReal = [
  { id: "yellowai", domain: "yellow.ai", title: "Yellow.ai", description: "Enterprise conversational AI platform for customer support automation.", categoryId: "cat-ai-tools", createdHoursAgo: 18, clicks: 2 },
  { id: "observeai", domain: "observe.ai", title: "Observe.AI", description: "AI platform that analyses contact-centre calls for quality and coaching insights.", categoryId: "cat-ai-tools", createdHoursAgo: 14, clicks: 1 },
  { id: "verloop", domain: "verloop.io", title: "Verloop.io", description: "AI-powered customer support automation for chat and voice.", categoryId: "cat-ai-agents", createdHoursAgo: 21, clicks: 2 },
  { id: "rephrase", domain: "rephrase.ai", title: "Rephrase.ai", description: "AI video generation platform for creating personalised avatar videos at scale.", categoryId: "cat-ai-design", createdHoursAgo: 16, clicks: 1 },
  { id: "whatfix", domain: "whatfix.com", title: "Whatfix", description: "Digital adoption platform with in-app guidance and walkthroughs for software.", categoryId: "cat-saas", createdHoursAgo: 44, clicks: 3 },
  { id: "darwinbox", domain: "darwinbox.com", title: "Darwinbox", description: "HR technology suite covering hiring, payroll, and employee management.", categoryId: "cat-saas", createdHoursAgo: 38, clicks: 2 },
  { id: "leadsquared", domain: "leadsquared.com", title: "LeadSquared", description: "Sales execution and marketing automation CRM for growing businesses.", categoryId: "cat-saas", createdHoursAgo: 31, clicks: 2 },
  { id: "zluri", domain: "zluri.com", title: "Zluri", description: "SaaS management platform for discovering, securing, and optimising software spend.", categoryId: "cat-saas", createdHoursAgo: 12, clicks: 1 },
  { id: "appsmith", domain: "appsmith.com", title: "Appsmith", description: "Open-source, low-code platform for building internal business tools.", categoryId: "cat-dev-tools", createdHoursAgo: 25, clicks: 2 },
  { id: "middleware", domain: "middleware.io", title: "Middleware", description: "Full-stack observability platform for monitoring logs, metrics, and traces.", categoryId: "cat-dev-tools", createdHoursAgo: 9, clicks: 1 },
  { id: "khatabook", domain: "khatabook.com", title: "Khatabook", description: "Digital ledger app for small merchants to track credit and payments.", categoryId: "cat-mobile-apps", createdHoursAgo: 74, clicks: 6 },
  { id: "okcredit", domain: "okcredit.in", title: "OkCredit", description: "Bookkeeping app for small shopkeepers to record customer credit digitally.", categoryId: "cat-mobile-apps", createdHoursAgo: 69, clicks: 4 },
  { id: "pixis", domain: "pixis.ai", title: "Pixis", description: "AI-native marketing platform for optimising ad performance across channels.", categoryId: "cat-marketing", createdHoursAgo: 20, clicks: 1 },
  { id: "growthx", domain: "growthx.club", title: "GrowthX", description: "Community and cohort-based courses for marketing and growth professionals.", categoryId: "cat-communities", createdHoursAgo: 17, clicks: 2 },
  { id: "fampay", domain: "fampay.in", title: "FamPay", description: "Payment app and card built for teenagers, with parental controls.", categoryId: "cat-fintech", createdHoursAgo: 26, clicks: 2 },
  { id: "setu", domain: "setu.co", title: "Setu", description: "Fintech infrastructure APIs for banking, payments, and lending products.", categoryId: "cat-fintech", createdHoursAgo: 22, clicks: 1 },
  { id: "openmoney", domain: "open.money", title: "Open", description: "Neobanking platform for businesses to manage payments and accounting.", categoryId: "cat-fintech", createdHoursAgo: 19, clicks: 2 },
  { id: "niyo", domain: "goniyo.com", title: "Niyo", description: "Neobank offering zero-forex travel cards and salary accounts.", categoryId: "cat-fintech", createdHoursAgo: 15, clicks: 1 },
  { id: "slice", domain: "sliceit.com", title: "Slice", description: "Fintech app offering a credit card and UPI payments for young professionals.", categoryId: "cat-fintech", createdHoursAgo: 13, clicks: 3 },
  { id: "smallcase", domain: "smallcase.com", title: "smallcase", description: "Platform for investing in ready-made portfolios of stocks and ETFs.", categoryId: "cat-investing", createdHoursAgo: 34, clicks: 3 },
  { id: "fisdom", domain: "fisdom.com", title: "Fisdom", description: "Wealth management app for mutual funds, stocks, and tax filing.", categoryId: "cat-investing", createdHoursAgo: 11, clicks: 1 },
  { id: "mudrex", domain: "mudrex.com", title: "Mudrex", description: "Crypto investment platform with automated trading strategies.", categoryId: "cat-crypto", createdHoursAgo: 10, clicks: 1 },
  { id: "licious", domain: "licious.in", title: "Licious", description: "Direct-to-consumer brand delivering fresh meat and seafood.", categoryId: "cat-ecommerce", createdHoursAgo: 51, clicks: 4 },
  { id: "wakefit", domain: "wakefit.co", title: "Wakefit", description: "Direct-to-consumer brand for mattresses and home and sleep products.", categoryId: "cat-ecommerce", createdHoursAgo: 46, clicks: 3 },
  { id: "countrydelight", domain: "countrydelight.in", title: "Country Delight", description: "Subscription delivery for farm-fresh milk, dairy, and groceries.", categoryId: "cat-ecommerce", createdHoursAgo: 37, clicks: 2 },
  { id: "sugarcosmetics", domain: "sugarcosmetics.com", title: "Sugar Cosmetics", description: "Direct-to-consumer brand for makeup and cosmetics.", categoryId: "cat-ecommerce", createdHoursAgo: 28, clicks: 3 },
  { id: "squareyards", domain: "squareyards.com", title: "Square Yards", description: "Real estate brokerage platform for buying, selling, and renting property.", categoryId: "cat-real-estate", createdHoursAgo: 23, clicks: 2 },
  { id: "proptiger", domain: "proptiger.com", title: "PropTiger", description: "Property portal for new residential projects and home loans.", categoryId: "cat-real-estate", createdHoursAgo: 8, clicks: 1 },
  { id: "pristyncare", domain: "pristyncare.com", title: "Pristyn Care", description: "Platform connecting patients with surgeons for day-care surgical procedures.", categoryId: "cat-healthcare", createdHoursAgo: 32, clicks: 2 },
  { id: "healthifyme", domain: "healthifyme.com", title: "HealthifyMe", description: "AI-powered app for calorie tracking, diet plans, and fitness coaching.", categoryId: "cat-healthcare", createdHoursAgo: 7, clicks: 3 },
  { id: "toppr", domain: "toppr.com", title: "Toppr", description: "Online learning app for school students preparing for exams.", categoryId: "cat-education", createdHoursAgo: 49, clicks: 3 },
  { id: "testbook", domain: "testbook.com", title: "Testbook", description: "Exam preparation platform for government and competitive exams.", categoryId: "cat-education", createdHoursAgo: 43, clicks: 2 },
  { id: "classplus", domain: "classplus.co", title: "Classplus", description: "SaaS platform helping coaching institutes run classes and content online.", categoryId: "cat-education", createdHoursAgo: 35, clicks: 2 },
  { id: "leadschool", domain: "leadschool.in", title: "LEAD", description: "School edtech platform providing curriculum, training, and technology to schools.", categoryId: "cat-education", createdHoursAgo: 6, clicks: 1 },
  { id: "chingari", domain: "chingari.io", title: "Chingari", description: "Short-video social media app for Indian creators.", categoryId: "cat-creators", createdHoursAgo: 5, clicks: 2 },
  { id: "josh", domain: "myjosh.in", title: "Josh", description: "Short-video app for regional-language content and creators.", categoryId: "cat-creators", createdHoursAgo: 4, clicks: 1 },
  { id: "flexiple", domain: "flexiple.com", title: "Flexiple", description: "Marketplace connecting vetted freelance developers and designers with clients.", categoryId: "cat-freelancers", createdHoursAgo: 3, clicks: 1 },
  { id: "goqii", domain: "goqii.com", title: "GOQii", description: "Fitness wearable and coaching platform with certified health coaches.", categoryId: "cat-coaches", cityId: "city-mumbai", createdHoursAgo: 20, clicks: 3 },
];

// Fictional example listings only — demo the claimed/paid state and premium lock,
// and seed an initial "total raised" figure. Never real companies.
const demoListings = [
  { id: "demo-rupeetrack", domain: "rupeetrack.in", title: "RupeeTrack", description: "Expense tracking and budgeting app built for Indian bank accounts and UPI statements.", categoryId: "cat-fintech", createdHoursAgo: 240, clicks: 120, demoBid: 251, demoBidHoursAgo: 2 },
  { id: "demo-chaiandcode", domain: "chaiandcode.dev", title: "Chai & Code", description: "A directory and community of Indian developer meetups and hackathons.", categoryId: "cat-communities", createdHoursAgo: 400, clicks: 80, demoBid: 191, demoBidHoursAgo: 20 },
  { id: "demo-pixelcraft", domain: "pixelcraft.studio", title: "PixelCraft Studio", description: "AI-assisted logo and brand kit generator tuned for D2C brands in India.", categoryId: "cat-ai-design", createdHoursAgo: 150, clicks: 55, demoBid: 121, demoBidHoursAgo: 5 },
  { id: "demo-deskhero", domain: "deskhero.app", title: "DeskHero", description: "Lightweight helpdesk and ticketing SaaS for small D2C support teams.", categoryId: "cat-saas", createdHoursAgo: 80, clicks: 40, demoBid: 81, demoBidHoursAgo: 30 },
  { id: "demo-growthstack", domain: "growthstack.io", title: "GrowthStack", description: "Plug-and-play growth playbooks and SEO audits for early-stage founders.", categoryId: "cat-marketing", createdHoursAgo: 60, clicks: 25, demoBid: 61, demoBidHoursAgo: 40 },
  { id: "demo-agentdesk", domain: "agentdesk.ai", title: "AgentDesk", description: "No-code builder for customer support AI agents trained on your docs.", categoryId: "cat-ai-agents", createdHoursAgo: 30, clicks: 15, demoBid: 41, demoBidHoursAgo: 28 },
  { id: "demo-coachkart", domain: "coachkart.in", title: "CoachKart", description: "Booking and cohort management for online coaches and creators.", categoryId: "cat-coaches", createdHoursAgo: 10, clicks: 8, demoBid: 21, demoBidHoursAgo: 10 },
  { id: "demo-baycasa", domain: "baycasa.in", title: "BayCasa Realty", description: "Verified resale flats and rentals across Mumbai's western suburbs.", categoryId: "cat-real-estate", cityId: "city-mumbai", createdHoursAgo: 500, clicks: 200, demoBid: 341, demoBidHoursAgo: 1, demoLockedHours: 2 },
  { id: "demo-tiffinwaale", domain: "tiffinwaale.com", title: "TiffinWaale", description: "Home-cook tiffin subscriptions delivered across Andheri and Bandra.", categoryId: "cat-ecommerce", cityId: "city-mumbai", createdHoursAgo: 300, clicks: 90, demoBid: 151, demoBidHoursAgo: 15 },
];

async function main() {
  const { data: cats, error: catErr } = await supabase.from("categories").select("id, slug");
  if (catErr) throw catErr;
  const { data: cits, error: citErr } = await supabase.from("cities").select("id, slug");
  if (citErr) throw citErr;

  const catIdBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  const cityIdBySlug = Object.fromEntries(cits.map((c) => [c.slug, c.id]));

  const all = [...moreReal, ...demoListings];

  const rows = all.map((s) => {
    const isClaimed = s.demoBid != null;
    const url = `https://${s.domain}`;
    return {
      url,
      normalized_url: url,
      title: s.title,
      description: s.description,
      category_id: catIdBySlug[categorySlugById[s.categoryId]],
      city_id: s.cityId ? cityIdBySlug[citySlugById[s.cityId]] : null,
      current_bid: s.demoBid ?? 0,
      is_claimed: isClaimed,
      is_locked: s.demoLockedHours != null,
      locked_until: s.demoLockedHours != null ? hoursAgo(-s.demoLockedHours) : null,
      favicon_url: favicon(s.domain),
      click_count: s.clicks ?? 0,
      created_at: hoursAgo(s.createdHoursAgo),
      last_bid_at: isClaimed ? hoursAgo(s.demoBidHoursAgo ?? s.createdHoursAgo) : null,
      is_active: true,
      moderation_status: "approved",
      _demoBid: s.demoBid,
      _demoLocked: s.demoLockedHours != null,
    };
  });

  // Idempotency: skip any URL already present.
  const { data: existing } = await supabase.from("listings").select("normalized_url");
  const existingUrls = new Set((existing ?? []).map((r) => r.normalized_url));
  const toInsert = rows.filter((r) => !existingUrls.has(r.normalized_url));

  if (toInsert.length === 0) {
    console.log("Nothing to insert — all URLs already exist.");
    return;
  }

  const insertPayload = toInsert.map((r) => {
    const clean = { ...r };
    delete clean._demoBid;
    delete clean._demoLocked;
    return clean;
  });

  const { data: inserted, error: insertErr } = await supabase
    .from("listings")
    .insert(insertPayload)
    .select("id, title, current_bid, created_at, normalized_url");
  if (insertErr) throw insertErr;

  console.log(`Inserted ${inserted.length} listings.`);

  const activityRows = inserted.map((row) => {
    const source = toInsert.find((r) => r.normalized_url === row.normalized_url);
    if (source._demoBid != null) {
      return {
        listing_id: row.id,
        event_type: source._demoLocked ? "top_locked" : "bid_placed",
        amount: source._demoBid,
        timestamp: row.created_at,
      };
    }
    return {
      listing_id: row.id,
      event_type: "listing_created",
      amount: null,
      timestamp: row.created_at,
    };
  });

  const { error: activityErr } = await supabase.from("activity_feed").insert(activityRows);
  if (activityErr) throw activityErr;
  console.log(`Inserted ${activityRows.length} activity_feed rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
