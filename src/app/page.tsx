import ActivityFeed from "@/components/ActivityFeed";
import PageShell from "@/components/PageShell";
import StatsBar from "@/components/StatsBar";
import { CATEGORY_GROUPS, getActivityFeed, getCategories, getCities, getListings, getSiteStats } from "@/lib/data";

// Bids can change at any moment — never serve a stale cached leaderboard.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [listings, categories, cities, activityFeed, stats] = await Promise.all([
    getListings(),
    getCategories(),
    getCities(),
    getActivityFeed(),
    getSiteStats(),
  ]);

  return (
    <PageShell
      listings={listings}
      categories={categories}
      categoryGroups={CATEGORY_GROUPS}
      cities={cities}
      charityDonated={stats.charityDonated}
    >
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
  );
}
