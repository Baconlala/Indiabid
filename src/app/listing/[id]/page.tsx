import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CopyLinkButton from "@/components/CopyLinkButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { minimumBidToTakeLead } from "@/lib/bidding";
import { formatRupees, formatCount, timeAgo } from "@/lib/format";
import {
  getCategories,
  getCities,
  getListingById,
  getListingTodayActivity,
  getListings,
  sortBoard,
} from "@/lib/data";
import type { Listing } from "@/lib/types";

// Bid/claim state can change at any moment — never serve a stale cached listing.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return {};

  const listings = await getListings();
  const board = sortBoard(listings, listing.cityId);
  const rank = board.findIndex((l) => l.id === listing.id) + 1;

  const title = rank > 0 ? `${listing.title} · #${rank} on IndiaBid` : `${listing.title} on IndiaBid`;
  const imageUrl = `/api/og?listingId=${id}&variant=ranked`;
  return {
    title,
    description: listing.description,
    openGraph: { title, description: listing.description, images: [imageUrl] },
    twitter: { card: "summary_large_image", title, description: listing.description, images: [imageUrl] },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const [categories, cities, listings, todayActivity] = await Promise.all([
    getCategories(),
    getCities(),
    getListings(),
    getListingTodayActivity(id),
  ]);
  const category = categories.find((c) => c.id === listing.categoryId);
  const city = listing.cityId ? cities.find((c) => c.id === listing.cityId) : null;
  const domain = safeDomain(listing.url);

  const board = sortBoard(listings, listing.cityId);
  const overallRank = board.findIndex((l) => l.id === listing.id) + 1;
  const overallTotal = board.length;

  const categoryBoard = board.filter((l) => l.categoryId === listing.categoryId);
  const categoryRank = categoryBoard.findIndex((l) => l.id === listing.id) + 1;
  const categoryTotal = categoryBoard.length;

  const outrankAmount = minimumBidToTakeLead(listing.currentBid);
  const boardLabel = city ? city.name : "national";

  const nearby: Listing[] = categoryBoard.filter((l) => l.id !== listing.id).slice(0, 4);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 pb-16 sm:px-6">
        <Link href={city ? "/local" : "/"} className="text-sm text-muted hover:text-foreground">
          ← Back to leaderboard
        </Link>

        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex h-40 items-center justify-center rounded-2xl bg-surface-raised">
            {listing.faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.faviconUrl} alt="" className="h-12 w-12 opacity-90" />
            ) : (
              <span className="text-4xl font-black text-muted">{listing.title.charAt(0)}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-foreground/80">
                {category.icon} {category.name}
              </span>
            )}
            {city && (
              <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-foreground/80">
                📍 {city.name}
              </span>
            )}
            {!listing.isClaimed && (
              <span className="rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold text-danger">
                Unclaimed
              </span>
            )}
            {listing.isLocked && (
              <span className="rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-black">
                🔒 Locked at #1
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {listing.title}
          </h1>
          <p className="text-foreground/85">{listing.description}</p>

          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-saffron hover:underline"
          >
            {domain} ↗
          </a>

          <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
            <Stat label="Price paid" value={listing.isClaimed ? formatRupees(listing.currentBid) : "-"} />
            <Stat label="Posted" value={timeAgo(listing.createdAt)} />
            <Stat label="Verified clicks" value={formatCount(listing.clickCount)} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/claim/${listing.id}`}
              className="flex-1 rounded-full bg-saffron px-6 py-3 text-center text-sm font-bold text-black transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {listing.isClaimed ? "Claim this rank" : "Run this? Claim it free"}
            </Link>
            <CopyLinkButton
              path={`/listing/${listing.id}`}
              className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground/80 hover:border-saffron"
            />
          </div>
          <WhatsAppShareButton
            path={`/listing/${listing.id}`}
            text={`🏆 ${listing.title} is on the IndiaBid leaderboard! Check it out:`}
            label="Share on WhatsApp"
            className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground/80 hover:border-saffron"
          />
        </div>

        {overallRank > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <RankCard
              label="Category rank"
              rank={categoryRank}
              total={categoryTotal}
              of={category?.name ?? "this category"}
              href={category ? `/category/${category.slug}` : undefined}
            />
            <RankCard
              label="Overall"
              rank={overallRank}
              total={overallTotal}
              of={`the ${boardLabel} board`}
              href={city ? "/local" : "/"}
            />
          </div>
        )}

        {overallRank > 0 && (
          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-5">
            <h2 className="text-sm font-bold text-foreground">About this ranking</h2>
            <FaqItem question={`What rank does ${listing.title} hold on IndiaBid?`}>
              {listing.title} has spent {formatRupees(listing.currentBid)} on IndiaBid to rank #
              {categoryRank} of {categoryTotal} in {category?.name ?? "its category"} and #{overallRank} of{" "}
              {overallTotal} on the {boardLabel} board.
            </FaqItem>
            <FaqItem question={`Has ${listing.title} ranked today?`}>
              {todayActivity.hasActivity
                ? `Yes. ${listing.title} added ${formatRupees(todayActivity.amountToday)} in bids in the last 24 hours.`
                : `Not yet. ${listing.title} hasn't added any spend in the last 24 hours — check today's board.`}
            </FaqItem>
            <FaqItem question={`How do I outrank ${listing.title}?`}>
              Anyone can take this spot for {formatRupees(outrankAmount)} on the {boardLabel} board.
            </FaqItem>
          </div>
        )}

        {nearby.length > 0 && category && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Also in {category.name}</h2>
              <Link href={`/category/${category.slug}`} className="text-xs text-muted hover:text-foreground">
                See all →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {nearby.map((l) => (
                <Link
                  key={l.id}
                  href={`/listing/${l.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 text-sm transition-colors hover:border-saffron/40"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">{l.title}</span>
                  <span className="shrink-0 font-bold text-foreground/80 tabular-nums">
                    {l.isClaimed ? formatRupees(l.currentBid) : "Unclaimed"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="text-base font-bold tabular-nums text-foreground">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

function RankCard({
  label,
  rank,
  total,
  of,
  href,
}: {
  label: string;
  rank: number;
  total: number;
  of: string;
  href?: string;
}) {
  const content = (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-4">
      <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">{label}</span>
      <span className="text-2xl font-black text-foreground">#{rank}</span>
      <span className="text-xs text-muted">
        of {total} in {of}
      </span>
      {href && <span className="mt-1 text-xs font-semibold text-saffron">See ranking →</span>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-foreground">{question}</h3>
      <p className="text-sm text-foreground/75">{children}</p>
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
