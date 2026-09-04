"use client";

import { useMemo, useState } from "react";
import type { Category, CategoryGroup, City, Listing } from "@/lib/types";
import { minimumBidToTakeLead } from "@/lib/bidding";
import { formatRupees } from "@/lib/format";
import { useAgeGate } from "@/lib/age-gate-context";
import BoardTabs from "./BoardTabs";
import BidWidget from "./BidWidget";
import CategoryPills from "./CategoryPills";
import Leaderboard from "./Leaderboard";

type Props = {
  listings: Listing[];
  categories: Category[];
  categoryGroups: readonly CategoryGroup[];
  cities: City[];
  cityId: string | null;
  onCityChange: (cityId: string | null) => void;
};

export default function HomeExplorer({
  listings,
  categories,
  categoryGroups,
  cities,
  cityId,
  onCityChange,
}: Props) {
  const [categoryId, setCategoryId] = useState<string | "all">("all");
  const { adultUnlocked } = useAgeGate();
  const categoryById = (id: string) => categories.find((c) => c.id === id);

  const boardListings = useMemo(() => {
    return listings
      .filter((l) => l.isActive && l.cityId === cityId)
      .filter((l) => categoryId === "all" || l.categoryId === categoryId)
      .filter((l) => {
        const cat = categories.find((c) => c.id === l.categoryId);
        return !cat?.isSensitive || (cat.slug === "adult" && adultUnlocked);
      })
      .sort((a, b) => {
        if (b.currentBid !== a.currentBid) return b.currentBid - a.currentBid;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [listings, cityId, categoryId, categories, adultUnlocked]);

  const topBid = boardListings[0]?.currentBid ?? 0;
  const minBid = minimumBidToTakeLead(topBid);
  const boardLabel = cityId ? cities.find((c) => c.id === cityId)?.name ?? "Local" : "National";

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <BoardTabs cities={cities} selected={cityId} onSelect={onCityChange} />

      <BidWidget boardLabel={boardLabel} minBid={minBid} hasLeader={topBid > 0} />

      <CategoryPills
        categories={categories}
        groups={categoryGroups}
        selected={categoryId}
        onSelect={setCategoryId}
      />

      <Leaderboard listings={boardListings} categoryById={categoryById} />

      <div className="fixed inset-x-4 bottom-4 z-30 sm:hidden">
        <button
          type="button"
          disabled
          title="Checkout flow is coming in the next step"
          className="w-full rounded-full bg-saffron py-3.5 text-center text-sm font-bold text-black shadow-lg shadow-black/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Claim #1 for {formatRupees(minBid)}
        </button>
      </div>
    </div>
  );
}
