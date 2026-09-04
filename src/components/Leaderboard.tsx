import type { Category, Listing } from "@/lib/types";
import RankRow from "./RankRow";

type Props = {
  listings: Listing[];
  categoryById: (id: string) => Category | undefined;
};

export default function Leaderboard({ listings, categoryById }: Props) {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
        No listings here yet. Be the first to add one — it&apos;s free.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {listings.map((listing, i) => (
        <RankRow
          key={listing.id}
          rank={i + 1}
          listing={listing}
          category={categoryById(listing.categoryId)}
        />
      ))}
    </div>
  );
}
