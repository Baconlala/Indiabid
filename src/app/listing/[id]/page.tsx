import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WhatsAppShareButton from "@/components/WhatsAppShareButton";
import { formatRupees, formatCount, timeAgo } from "@/lib/format";
import { getCategories, getCities, getListingById } from "@/lib/data";

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

  const title = `${listing.title} on IndiaBid`;
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

  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  const category = categories.find((c) => c.id === listing.categoryId);
  const city = listing.cityId ? cities.find((c) => c.id === listing.cityId) : null;
  const domain = safeDomain(listing.url);

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

          <Link
            href={`/claim/${listing.id}`}
            className="mt-2 rounded-full bg-saffron px-6 py-3 text-center text-sm font-bold text-black transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            {listing.isClaimed ? "Claim this rank" : "Run this? Claim it free"}
          </Link>
          <WhatsAppShareButton
            path={`/listing/${listing.id}`}
            text={`🏆 ${listing.title} is on the IndiaBid leaderboard! Check it out:`}
            label="Share on WhatsApp"
            className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground/80 hover:border-saffron"
          />
        </div>
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

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
