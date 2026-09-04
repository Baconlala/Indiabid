import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LocalExplorer from "@/components/LocalExplorer";
import { CATEGORY_GROUPS, getCategories, getCities, getListings } from "@/lib/data";

export const metadata = {
  title: "Local Leaderboards — IndiaBid",
  description: "City-by-city pay-to-rank leaderboards across India.",
};

// Bids can change at any moment — never serve a stale cached leaderboard.
export const dynamic = "force-dynamic";

export default async function LocalPage() {
  const [listings, categories, cities] = await Promise.all([getListings(), getCategories(), getCities()]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col gap-8 px-4 py-8 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Local leaderboards
          </h1>
          <p className="text-sm text-muted">
            Every city ranks separately. Pick a city to see who&apos;s on top.
          </p>
        </div>
        <LocalExplorer
          listings={listings}
          categories={categories}
          categoryGroups={CATEGORY_GROUPS}
          cities={cities}
          defaultCityId={cities[0].id}
        />
      </main>
      <Footer />
    </>
  );
}
