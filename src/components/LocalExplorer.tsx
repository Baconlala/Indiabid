"use client";

import { useState } from "react";
import type { Category, CategoryGroup, City, Listing } from "@/lib/types";
import HomeExplorer from "./HomeExplorer";

type Props = {
  listings: Listing[];
  categories: Category[];
  categoryGroups: readonly CategoryGroup[];
  cities: City[];
  defaultCityId: string;
};

export default function LocalExplorer({
  listings,
  categories,
  categoryGroups,
  cities,
  defaultCityId,
}: Props) {
  const [cityId, setCityId] = useState<string | null>(defaultCityId);

  return (
    <HomeExplorer
      listings={listings}
      categories={categories}
      categoryGroups={categoryGroups}
      cities={cities}
      cityId={cityId}
      onCityChange={setCityId}
    />
  );
}
