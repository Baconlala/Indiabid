import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TrendingToday from "@/components/TrendingToday";
import { getCategories, getTrendingToday } from "@/lib/data";

export const metadata = {
  title: "Trending Today · IndiaBid",
  description: "Who's moved the most rupees on IndiaBid in the last 24 hours.",
};

// Rankings here are a rolling last-24h window — never cache this page.
export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const [entries, categories] = await Promise.all([getTrendingToday(50), getCategories()]);
  const categoryById = (id: string) => categories.find((c) => c.id === id);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            🔥 Trending today
          </h1>
          <p className="text-sm text-muted">
            Ranked by rupees bid in the last 24 hours (separate from the permanent leaderboard).
          </p>
        </div>
        <TrendingToday entries={entries} categoryById={categoryById} />
      </main>
      <Footer />
    </>
  );
}
