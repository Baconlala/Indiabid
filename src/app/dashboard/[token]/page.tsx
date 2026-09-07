import { notFound } from "next/navigation";
import ClickChart from "@/components/ClickChart";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { formatCount, formatRupees, timeAgo } from "@/lib/format";
import { getCategories, getListingByMagicToken, getListings, sortBoard } from "@/lib/data";
import { clicksByDay, generateClickLog } from "@/lib/mock-clicks";

// Rank/bid/clicks all change live — never cache this page.
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const listing = await getListingByMagicToken(token);
  if (!listing) notFound();

  const [categories, listings] = await Promise.all([getCategories(), getListings()]);
  const category = categories.find((c) => c.id === listing.categoryId);
  const board = sortBoard(listings, listing.cityId);
  const rank = board.findIndex((l) => l.id === listing.id) + 1;
  const clicks = generateClickLog(listing);
  const daily = clicksByDay(clicks, 14);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">
            Owner dashboard
          </span>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {listing.title}
          </h1>
          {category && (
            <span className="text-sm text-muted">
              {category.icon} {category.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Current rank" value={rank > 0 ? `#${rank}` : "-"} />
          <StatCard
            label="Current bid"
            value={listing.isClaimed ? formatRupees(listing.currentBid) : "Unclaimed"}
          />
          <StatCard label="Total clicks" value={formatCount(listing.clickCount)} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <WhatsAppShareButton
            path={`/listing/${listing.slug}`}
            text={`🏆 ${listing.title} is ranked #${rank || "?"} on IndiaBid! Check it out:`}
            label="📤 Brag about your rank"
            className="flex-1 rounded-full border border-border px-4 py-2.5 text-center text-sm font-semibold text-foreground/80 hover:border-saffron"
          />
          {listing.isClaimed && rank !== 1 && (
            <WhatsAppShareButton
              path={`/claim/${listing.id}`}
              text={`😱 ${listing.title} just got outbid on IndiaBid! Help reclaim the spot:`}
              label="😱 Share that you got outbid"
              className="flex-1 rounded-full border border-danger/40 bg-danger/10 px-4 py-2.5 text-center text-sm font-semibold text-danger hover:border-danger"
            />
          )}
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Clicks, last 14 days</h2>
          <ClickChart data={daily} />
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent click log</h2>
          {clicks.length === 0 ? (
            <p className="text-sm text-muted">No clicks recorded yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {clicks.slice(0, 25).map((c, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-foreground/85">{c.referrer}</span>
                  <span className="text-xs text-muted">{timeAgo(c.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
      <div className="text-lg font-bold tabular-nums text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted">{label}</div>
    </div>
  );
}
