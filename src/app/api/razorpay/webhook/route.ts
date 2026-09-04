import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { recordVerifiedPayment } from "@/lib/process-payment";

// The reliable path per the original spec: Razorpay calls this directly on
// payment.captured, so a rank change lands even if the buyer's browser
// closes right after paying (before the client-triggered /verify call fires).
// Configure the URL + secret in the Razorpay dashboard once deployed —
// this can't be exercised from localhost without a public tunnel.
export async function POST(request: Request) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 501 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "payment.captured") {
    return NextResponse.json({ ok: true, skipped: event.event });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment?.id) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  try {
    await recordVerifiedPayment(payment.order_id, payment.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook failed to persist payment", err);
    // Non-2xx so Razorpay retries.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
