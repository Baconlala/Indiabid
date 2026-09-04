import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { recordVerifiedPayment } from "@/lib/process-payment";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ verified: false, error: "Missing payment fields" }, { status: 400 });
  }

  const verified = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!verified) {
    return NextResponse.json({ verified: false });
  }

  // The Razorpay charge succeeded regardless of what happens next, so we
  // still report verified: true even if the DB write below has a problem —
  // that failure is surfaced separately via `persisted`.
  try {
    const result = await recordVerifiedPayment(orderId, paymentId);
    return NextResponse.json({
      verified: true,
      persisted: result.status !== "listing_missing",
      newCurrentBid: "newCurrentBid" in result ? result.newCurrentBid : undefined,
    });
  } catch (err) {
    console.error("Failed to persist verified payment", err);
    return NextResponse.json({ verified: true, persisted: false });
  }
}
