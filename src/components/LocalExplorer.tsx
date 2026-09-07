"use client";

import { useState } from "react";
import type { Category, CategoryGroup, City, Listing } from "@/lib/types";
import HomeExplorer from "./HomeExplorer";
import RestaurantSection from "./RestaurantSection";

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
  const cityName = cities.find((c) => c.id === cityId)?.name;

  return (
    <div className="flex flex-col gap-8">
      <HomeExplorer
        listings={listings}
        categories={categories}
        categoryGroups={categoryGroups}
        cities={cities}
        cityId={cityId}
        onCityChange={setCityId}
      />
      {cityId && cityName && (
        <RestaurantSection
          listings={listings}
          categories={categories}
          cityId={cityId}
          cityName={cityName}
        />
      )}
    </div>
  );
}
