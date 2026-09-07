import type { Category, Listing } from "@/lib/types";
import Leaderboard from "./Leaderboard";

type Props = {
  listings: Listing[];
  categories: Category[];
  cityId: string;
  cityName: string;
};

export default function RestaurantSection({ listings, categories, cityId, cityName }: Props) {
  const restaurantCategory = categories.find((c) => c.slug === "restaurants");
  if (!restaurantCategory) return null;

  const restaurantListings = listings
    .filter((l) => l.isActive && l.cityId === cityId && l.categoryId === restaurantCategory.id)
    .sort((a, b) => {
      if (b.currentBid !== a.currentBid) return b.currentBid - a.currentBid;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-saffron/20 bg-saffron/5 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold text-foreground">🍽️ Restaurants in {cityName}</h2>
        <p className="text-xs text-muted">
          Ranked separately from the general board — same pay-to-rank rules.
        </p>
      </div>
      <Leaderboard listings={restaurantListings} categoryById={() => restaurantCategory} />
    </div>
  );
}
