import Link from "next/link";
import { notFound } from "next/navigation";
import ClaimFlow from "@/components/ClaimFlow";
import Footer from "@/components/Footer";
import FreeClaimForm from "@/components/FreeClaimForm";
import Header from "@/components/Header";
import { computeClaimRequirement } from "@/lib/claim-logic";
import {
  getCategories,
  getListingById,
  getListingOwnershipStatus,
  getListings,
  sortBoard,
} from "@/lib/data";

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

  const [categories, listings, ownership] = await Promise.all([
    getCategories(),
    getListings(),
    getListingOwnershipStatus(id),
  ]);
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

        {ownership && !ownership.hasOwner && (
          <FreeClaimForm listingId={listing.id} listingTitle={listing.title} />
        )}

        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold text-foreground">Bid for rank (paid)</h2>
          <p className="text-xs text-muted">
            Optional and separate from claiming ownership above — this is what actually moves your
            rank on the board.
          </p>
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
