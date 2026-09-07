import Link from "next/link";
import ActivityFeed from "@/components/ActivityFeed";
import JsonLd from "@/components/JsonLd";
import PageShell from "@/components/PageShell";
import StatsBar from "@/components/StatsBar";
import TrendingToday from "@/components/TrendingToday";
import {
  CATEGORY_GROUPS,
  getActivityFeed,
  getCategories,
  getCities,
  getListings,
  getSiteStats,
  getTrendingToday,
  sortBoard,
} from "@/lib/data";
import { itemListSchema } from "@/lib/structured-data";

// Bids can change at any moment — never serve a stale cached leaderboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [listings, categories, cities, activityFeed, stats, trending] = await Promise.all([
    getListings(),
    getCategories(),
    getCities(),
    getActivityFeed(),
    getSiteStats(),
    getTrendingToday(5),
  ]);
  const categoryById = (id: string) => categories.find((c) => c.id === id);
  const nationalBoard = sortBoard(listings, null).slice(0, 20);

  return (
    <>
      <JsonLd
        data={itemListSchema(
          nationalBoard,
          "IndiaBid National Leaderboard",
          "Businesses ranked by total amount paid on IndiaBid, India's pay-to-rank leaderboard."
        )}
      />
      <PageShell
      listings={listings}
      categories={categories}
      categoryGroups={CATEGORY_GROUPS}
      cities={cities}
      charityDonated={stats.charityDonated}
    >
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">🔥 Trending today</h2>
          <Link href="/daily" className="text-sm text-muted hover:text-foreground">
            See full list →
          </Link>
        </div>
        <TrendingToday entries={trending} categoryById={categoryById} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground">Site-wide stats</h2>
        <StatsBar
          totalRaised={stats.totalRaised}
          totalListings={stats.totalListings}
          claimedListings={stats.claimedListings}
          totalClicks={stats.totalClicks}
          charityDonated={stats.charityDonated}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-foreground">Latest activity</h2>
        <ActivityFeed
          events={activityFeed}
          listingById={(id) => listings.find((l) => l.id === id)}
        />
      </section>
      </PageShell>
    </>
  );
}
