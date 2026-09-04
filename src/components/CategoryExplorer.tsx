"use client";

import { useMemo, useState } from "react";
import type { Category, City, Listing } from "@/lib/types";
import { minimumBidToTakeLead } from "@/lib/bidding";
import BidWidget from "./BidWidget";
import BoardTabs from "./BoardTabs";
import Leaderboard from "./Leaderboard";

type Props = {
  listings: Listing[];
  category: Category;
  cities: City[];
};

export default function CategoryExplorer({ listings, category, cities }: Props) {
  const [cityId, setCityId] = useState<string | null>(null);

  // Rank is decided board-wide (national or a city), across every category —
  // a category page just filters which listings are shown, so the amount
  // needed to actually reach #1 must come from the whole board, not the filtered subset.
  const boardTopBid = useMemo(() => {
    return listings
      .filter((l) => l.isActive && l.cityId === cityId)
      .reduce((max, l) => Math.max(max, l.currentBid), 0);
  }, [listings, cityId]);

  const categoryListings = useMemo(() => {
    return listings
      .filter((l) => l.isActive && l.categoryId === category.id && l.cityId === cityId)
      .sort((a, b) => {
        if (b.currentBid !== a.currentBid) return b.currentBid - a.currentBid;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [listings, category.id, cityId]);

  const minBid = minimumBidToTakeLead(boardTopBid);
  const boardName = cityId ? cities.find((c) => c.id === cityId)?.name ?? "Local" : "National";

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <BoardTabs cities={cities} selected={cityId} onSelect={setCityId} />

      <BidWidget
        boardLabel={`${category.icon} ${category.name} · ${boardName}`}
        minBid={minBid}
        hasLeader={boardTopBid > 0}
      />

      <Leaderboard listings={categoryListings} categoryById={() => category} />
    </div>
  );
}
