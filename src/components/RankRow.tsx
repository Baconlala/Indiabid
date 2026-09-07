import Link from "next/link";
import type { Category, Listing } from "@/lib/types";
import { formatRupees, timeAgo } from "@/lib/format";

type Props = {
  rank: number;
  listing: Listing;
  category: Category | undefined;
};

// Top-3 get a colored numeral and a thin left accent bar — nothing more. No
// medals, no gradient fills; the number stays the focus and the accent is a
// single flat line, the same language dashboards use for status, not a
// decoration bolted onto a leaderboard row. Drawn as its own absolutely
// positioned element rather than a border-left utility, since unclaimed rows
// use a dashed card border and a border-left would inherit that dash pattern
// instead of rendering as a clean solid bar.
const PODIUM: Record<number, { text: string; bar: string }> = {
  1: { text: "text-gold", bar: "bg-gold" },
  2: { text: "text-zinc-400", bar: "bg-zinc-400" },
  3: { text: "text-amber-700", bar: "bg-amber-700" },
};

function rankColor(rank: number): string {
  return PODIUM[rank]?.text ?? "text-muted";
}

export default function RankRow({ rank, listing, category }: Props) {
  const domain = safeDomain(listing.url);
  const podium = PODIUM[rank];

  return (
    <div
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-3 transition-colors sm:gap-5 sm:p-4 ${
        listing.isClaimed
          ? "border-border bg-surface hover:border-saffron/40"
          : "border-dashed border-border/70 bg-transparent"
      }`}
    >
      {podium && <span className={`absolute inset-y-0 left-0 w-[3px] ${podium.bar}`} aria-hidden="true" />}
      <div
        className={`w-10 shrink-0 text-center text-3xl font-black tabular-nums sm:w-14 sm:text-4xl ${rankColor(rank)}`}
      >
        {rank}
      </div>

      <div className="relative hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-raised sm:flex sm:h-20 sm:w-28 sm:items-center sm:justify-center">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : listing.faviconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.faviconUrl} alt="" className="h-8 w-8 opacity-80" loading="lazy" />
        ) : (
          <span className="text-2xl font-black text-muted">{listing.title.charAt(0)}</span>
        )}
        {listing.isLocked && (
          <span className="absolute top-1 left-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-black">
            🔒 3h lock
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {listing.faviconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.faviconUrl} alt="" className="h-4 w-4 rounded-sm" />
          ) : null}
          <Link
            href={`/listing/${listing.id}`}
            className="truncate font-semibold text-foreground hover:text-saffron hover:underline"
          >
            {listing.title}
          </Link>
          {!listing.isClaimed && (
            <span className="shrink-0 rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-semibold text-danger">
              Unclaimed
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{listing.description}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
          {category && (
            <span>
              {category.icon} {category.name}
            </span>
          )}
          <span>·</span>
          <span>{domain}</span>
          {listing.clickCount > 0 && (
            <>
              <span>·</span>
              <span>{formatCount(listing.clickCount)} clicks</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {listing.isClaimed ? (
          <>
            <span className="text-lg font-bold text-foreground tabular-nums sm:text-xl">
              {formatRupees(listing.currentBid)}
            </span>
            {listing.lastBidAt && (
              <span className="text-[11px] text-muted">{timeAgo(listing.lastBidAt)}</span>
            )}
            <Link
              href={`/claim/${listing.id}`}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors group-hover:border-saffron group-hover:text-saffron"
            >
              Claim this rank
            </Link>
          </>
        ) : (
          <Link
            href={`/claim/${listing.id}`}
            className="rounded-full border border-india-green bg-india-green/10 px-3.5 py-2 text-xs font-semibold text-india-green transition-colors hover:bg-india-green/20"
          >
            Run this? Claim it free
          </Link>
        )}
      </div>
    </div>
  );
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatCount(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}
