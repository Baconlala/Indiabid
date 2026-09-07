import Link from "next/link";
import type { TrendingEntry } from "@/lib/data";
import { formatRupees } from "@/lib/format";
import type { Category } from "@/lib/types";

type Props = {
  entries: TrendingEntry[];
  categoryById: (id: string) => Category | undefined;
};

export default function TrendingToday({ entries, categoryById }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
        No bids in the last 24h yet — be the first to move the board today.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry, i) => {
        const category = categoryById(entry.listing.categoryId);
        return (
          <Link
            key={entry.listing.id}
            href={`/listing/${entry.listing.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-saffron/40"
          >
            <span className="w-6 shrink-0 text-center text-sm font-bold text-muted">{i + 1}</span>
            {entry.listing.faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.listing.faviconUrl} alt="" className="h-6 w-6 shrink-0 rounded-sm" />
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{entry.listing.title}</div>
              {category && (
                <div className="text-xs text-muted">
                  {category.icon} {category.name}
                </div>
              )}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm font-bold text-saffron">🔥 {formatRupees(entry.amountToday)}</div>
              <div className="text-[11px] text-muted">today</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
