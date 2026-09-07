import { NextResponse } from "next/server";
import { isValidBidStep, premiumLockAmount } from "@/lib/bidding";
import { computeClaimRequirement } from "@/lib/claim-logic";
import { createOrder } from "@/lib/razorpay";
import { getListingById, getListings, sortBoard } from "@/lib/data";

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Payments are temporarily disabled. Please check back soon." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const listingId = body?.listingId;
  const isLock = body?.isLock === true;
  const clientAmount = body?.amount;

  if (typeof listingId !== "string") {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const listing = await getListingById(listingId);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const allListings = await getListings();
  const board = sortBoard(allListings, listing.cityId);
  const requirement = computeClaimRequirement(listing, board);

  if (requirement.mode === "locked") {
    return NextResponse.json(
      { error: "This listing is already locked at #1 and cannot be outbid right now." },
      { status: 409 }
    );
  }

  // The amount actually charged is always computed here — a client-submitted
  // amount is only ever a lower bound the user chose to exceed by.
  let amount: number;
  if (isLock) {
    amount = premiumLockAmount(requirement.currentLeaderBid);
  } else {
    // Not validated against the global ₹21 sequence directly — a reclaim
    // amount is a delta, not a total. It only needs to be minRequired plus
    // whole ₹10 steps, which is what keeps the resulting total on-sequence.
    if (typeof clientAmount !== "number" || !isValidBidStep(clientAmount, requirement.minRequired)) {
      return NextResponse.json(
        { error: `Bid must be at least ₹${requirement.minRequired}, in ₹10 steps.` },
        { status: 400 }
      );
    }
    amount = clientAmount;
  }

  // DB bid_type constraint only knows claim/improve/reclaim/lock — "leader"
  // (raising your own already-leading bid) maps to "improve".
  const bidType = isLock ? "lock" : requirement.mode === "leader" ? "improve" : requirement.mode;

  try {
    const order = await createOrder(amount, `${listing.id}-${Date.now()}`, {
      listingId: listing.id,
      listingTitle: listing.title,
      bidType,
    });

    return NextResponse.json({
      orderId: order.id,
      amountPaise: order.amount,
      rupeeAmount: amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      listingTitle: listing.title,
    });
  } catch (err) {
    console.error("Razorpay order creation failed", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
