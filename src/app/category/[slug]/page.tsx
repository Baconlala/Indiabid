import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryExplorer from "@/components/CategoryExplorer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCategories, getCities, getListings } from "@/lib/data";

// Rank can change at any moment — never serve a stale cached board.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category || (category.isSensitive && category.slug !== "adult")) return {};

  const title = `${category.icon} ${category.name} · IndiaBid`;
  const description = `Who's ranked #1 in ${category.name} on IndiaBid, ranked by total paid.`;
  return { title, description, openGraph: { title, description } };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, cities, listings] = await Promise.all([getCategories(), getCities(), getListings()]);
  const category = categories.find((c) => c.slug === slug);
  // Adult is reachable (gated client-side by CategoryExplorer via the age-gate).
  // Other sensitive categories (gambling, MLM) have no public unlock path at all.
  if (!category || (category.isSensitive && category.slug !== "adult")) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col gap-8 px-4 py-8 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {category.icon} {category.name}
          </h1>
          <p className="text-sm text-muted">
            Ranked by total paid. National or a city board, your choice.
          </p>
        </div>
        <CategoryExplorer listings={listings} category={category} cities={cities} />
      </main>
      <Footer />
    </>
  );
}
