import Link from "next/link";
import { notFound } from "next/navigation";
import ClaimFlow from "@/components/ClaimFlow";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { computeClaimRequirement } from "@/lib/claim-logic";
import { getCategories, getListingById, getListings, sortBoard } from "@/lib/data";

// The required bid amount depends on live board state — never cache this page.
export const dynamic = "force-dynamic";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const [categories, listings] = await Promise.all([getCategories(), getListings()]);
  const category = categories.find((c) => c.id === listing.categoryId);
  const board = sortBoard(listings, listing.cityId);
  const { mode, minRequired, currentLeaderBid } = computeClaimRequirement(listing, board);

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 pb-16 sm:px-6">
        <Link href={`/listing/${listing.id}`} className="text-sm text-muted hover:text-foreground">
          ← Back to {listing.title}
        </Link>

        <div className="flex items-center gap-3">
          {listing.faviconUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.faviconUrl} alt="" className="h-8 w-8 rounded-sm" />
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">{listing.title}</h1>
            {category && (
              <span className="text-xs text-muted">
                {category.icon} {category.name}
              </span>
            )}
          </div>
        </div>

        <ClaimFlow
          listing={listing}
          mode={mode}
          minRequired={minRequired}
          currentLeaderBid={currentLeaderBid}
        />
      </main>
      <Footer />
    </>
  );
}
