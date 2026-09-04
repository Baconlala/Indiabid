import { createServiceSupabaseClient } from "./supabase";
import { fetchOrder } from "./razorpay";
import { PREMIUM_LOCK_HOURS } from "./bidding";

export type ProcessPaymentResult =
  | { status: "processed"; listingId: string; newCurrentBid: number }
  | { status: "already_processed"; listingId: string }
  | { status: "listing_missing" };

/**
 * The single place a captured Razorpay payment turns into a real rank
 * change. Called from both the client-triggered verify route (for instant
 * feedback) and the Razorpay webhook (the reliable fallback) — safe to call
 * twice for the same payment, since the `payments.razorpay_payment_id`
 * unique constraint makes this idempotent.
 */
export async function recordVerifiedPayment(orderId: string, paymentId: string): Promise<ProcessPaymentResult> {
  const supabase = createServiceSupabaseClient();

  // Trust the order we created, not anything the client claims now.
  const order = await fetchOrder(orderId);
  const listingId = order.notes?.listingId as string | undefined;
  const bidType = (order.notes?.bidType as string | undefined) ?? "claim";
  const paidRupees = Number(order.amount) / 100;

  if (!listingId) {
    throw new Error(`Order ${orderId} has no listingId in its notes`);
  }

  const { data: listing, error: listingErr } = await supabase
    .from("listings")
    .select("id, current_bid")
    .eq("id", listingId)
    .maybeSingle();
  if (listingErr) throw listingErr;
  if (!listing) return { status: "listing_missing" };

  const isLock = bidType === "lock";
  const isReclaim = bidType === "reclaim";
  // A reclaim payment is only the delta to retake the lead; every other
  // bid type is already the full new total.
  const newCurrentBid = isReclaim ? listing.current_bid + paidRupees : paidRupees;
  const lockedUntil = isLock
    ? new Date(Date.now() + PREMIUM_LOCK_HOURS * 60 * 60 * 1000).toISOString()
    : null;

  const { error: paymentErr } = await supabase.from("payments").insert({
    listing_id: listingId,
    amount: paidRupees,
    bid_type: bidType,
    previous_bid: listing.current_bid,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    status: "captured",
  });

  if (paymentErr) {
    // 23505 = unique_violation on razorpay_payment_id — already processed.
    if (paymentErr.code === "23505") {
      return { status: "already_processed", listingId };
    }
    throw paymentErr;
  }

  const { error: updateErr } = await supabase
    .from("listings")
    .update({
      current_bid: newCurrentBid,
      is_claimed: true,
      is_locked: isLock,
      locked_until: lockedUntil,
      last_bid_at: new Date().toISOString(),
    })
    .eq("id", listingId);
  if (updateErr) throw updateErr;

  const { error: activityErr } = await supabase.from("activity_feed").insert({
    listing_id: listingId,
    event_type: isLock ? "top_locked" : isReclaim ? "rank_reclaimed" : "bid_placed",
    amount: paidRupees,
    timestamp: new Date().toISOString(),
  });
  if (activityErr) throw activityErr;

  return { status: "processed", listingId, newCurrentBid };
}
