import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SubmitForm from "@/components/SubmitForm";
import { CATEGORY_GROUPS, getCategories, getCities } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add a Listing — IndiaBid",
  description: "Add your business or product to the leaderboard for free.",
};

export default async function SubmitPage() {
  const [categories, cities] = await Promise.all([getCategories(), getCities()]);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Add a listing
          </h1>
          <p className="text-sm text-muted">
            Free to add. Rank is earned separately — you can claim a spot right after.
          </p>
        </div>
        <SubmitForm categories={categories} categoryGroups={CATEGORY_GROUPS} cities={cities} />
      </main>
      <Footer />
    </>
  );
}
