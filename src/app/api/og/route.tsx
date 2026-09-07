import { ImageResponse } from "next/og";
import { getCategories, getListingById, getListings, sortBoard } from "@/lib/data";
import { formatRupees } from "@/lib/format";

export const runtime = "nodejs";

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");
  const variant = searchParams.get("variant") === "outbid" ? "outbid" : "ranked";

  if (!listingId) {
    return new Response("listingId is required", { status: 400 });
  }

  const listing = await getListingById(listingId);
  if (!listing) {
    return new Response("Listing not found", { status: 404 });
  }

  const [categories, listings] = await Promise.all([getCategories(), getListings()]);
  const category = categories.find((c) => c.id === listing.categoryId);
  const board = sortBoard(listings, listing.cityId);
  const rank = board.findIndex((l) => l.id === listing.id) + 1;

  const siteDomain = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.vercel.app").replace(/^https?:\/\//, "");

  const isOutbid = variant === "outbid";
  const accent = isOutbid ? "#ff6b6b" : "#f4c542";
  const headline = isOutbid ? "😱 YOU'VE BEEN OUTBID" : "🏆 RANKED ON INDIABID";
  const subline = isOutbid ? "Reclaim your spot before someone else does" : "See where everyone else stands";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#08080b",
          padding: "56px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 40 }}>🇮🇳</span>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#f4f4f2" }}>
              India<span style={{ color: "#ff9933" }}>Bid</span>
            </span>
          </div>
          <span style={{ fontSize: 22, color: "#8b8b96" }}>Made in India, For India</span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 700, color: accent }}>{headline}</span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              backgroundColor: "#17171d",
              borderRadius: 32,
              padding: "28px 48px",
              border: `2px solid ${accent}`,
            }}
          >
            <span style={{ fontSize: 96, fontWeight: 800, color: accent }}>
              {rank > 0 ? `#${rank}` : "-"}
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: "#f4f4f2" }}>{listing.title}</span>
              <span style={{ fontSize: 26, color: "#8b8b96" }}>
                {category ? `${category.icon} ${category.name} · ` : ""}
                {safeDomain(listing.url)}
              </span>
            </div>
          </div>

          {listing.isClaimed && (
            <span style={{ fontSize: 28, color: "#f4f4f2" }}>
              Currently claimed for {formatRupees(listing.currentBid)}
            </span>
          )}

          <span style={{ fontSize: 24, color: "#8b8b96" }}>{subline}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <span style={{ fontSize: 22, color: "#57575f" }}>{siteDomain}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
