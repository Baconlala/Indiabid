"use client";

import { useState, type ReactNode } from "react";
import type { Category, CategoryGroup, City, Listing } from "@/lib/types";
import CharityBanner from "./CharityBanner";
import Footer from "./Footer";
import Header from "./Header";
import Hero from "./Hero";
import HomeExplorer from "./HomeExplorer";

type Props = {
  listings: Listing[];
  categories: Category[];
  categoryGroups: readonly CategoryGroup[];
  cities: City[];
  charityDonated: number;
  children: ReactNode;
};

export default function PageShell({
  listings,
  categories,
  categoryGroups,
  cities,
  charityDonated,
  children,
}: Props) {
  const [cityId, setCityId] = useState<string | null>(null);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col gap-12 px-4 pb-16 sm:px-6">
        <Hero />
        <CharityBanner charityDonated={charityDonated} />
        <HomeExplorer
          listings={listings}
          categories={categories}
          categoryGroups={categoryGroups}
          cities={cities}
          cityId={cityId}
          onCityChange={setCityId}
        />
        {children}
      </main>
      <Footer />
    </>
  );
}
