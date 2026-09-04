import Razorpay from "razorpay";
import crypto from "crypto";

export function razorpayClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/** amount in whole rupees, converted to paise for Razorpay. */
export async function createOrder(amountRupees: number, receipt: string, notes: Record<string, string>) {
  const client = razorpayClient();
  return client.orders.create({
    amount: amountRupees * 100,
    currency: "INR",
    receipt,
    notes,
  });
}

/** Re-fetch an order from Razorpay so we trust its notes/amount, not whatever the client sends. */
export async function fetchOrder(orderId: string) {
  const client = razorpayClient();
  return client.orders.fetch(orderId);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
