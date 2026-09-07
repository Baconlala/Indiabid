"use client";

import { useState } from "react";
import Link from "next/link";
import type { Listing } from "@/lib/types";
import { BID_INCREMENT, MAX_BID, PREMIUM_LOCK_HOURS, isValidBidStep, premiumLockAmount } from "@/lib/bidding";
import { formatRupees } from "@/lib/format";
import { loadRazorpayScript } from "@/lib/load-razorpay-script";

type Mode = "claim" | "reclaim" | "leader" | "locked";

type Props = {
  listing: Listing;
  mode: Mode;
  minRequired: number;
  currentLeaderBid: number;
};

type PaymentResult =
  | { kind: "success"; paymentId: string; amount: number; persisted: boolean }
  | { kind: "error"; message: string };

const QUICK_ADDS = [100, 500, 5000];

const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";

function normalizeToStep(value: number, min: number): number {
  if (!Number.isFinite(value) || value < min) return min;
  const stepped = min + Math.round((value - min) / BID_INCREMENT) * BID_INCREMENT;
  return Math.min(stepped, MAX_BID);
}

export default function ClaimFlow({ listing, mode, minRequired, currentLeaderBid }: Props) {
  const [amount, setAmount] = useState(minRequired);
  const [amountInput, setAmountInput] = useState(String(minRequired));
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState<"bid" | "lock" | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const lockAmount = premiumLockAmount(currentLeaderBid);
  const atMax = amount >= MAX_BID;
  const canSubmit = consented && isValidBidStep(amount, minRequired) && PAYMENTS_ENABLED;

  function setAmountClamped(next: number) {
    const normalized = normalizeToStep(next, minRequired);
    setAmount(normalized);
    setAmountInput(String(normalized));
  }

  function commitTypedAmount() {
    const parsed = Number(amountInput.replace(/[^0-9]/g, ""));
    setAmountClamped(parsed);
  }

  async function pay(isLock: boolean) {
    setResult(null);
    setSubmitting(isLock ? "lock" : "bid");
    try {
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, amount, isLock }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) {
        setResult({ kind: "error", message: order.error ?? "Could not start checkout." });
        setSubmitting(null);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setResult({ kind: "error", message: "Could not load Razorpay checkout. Check your connection." });
        setSubmitting(null);
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "IndiaBid",
        description: `${isLock ? `Lock #1 for ${PREMIUM_LOCK_HOURS}h` : "Claim rank"}: ${listing.title}`,
        order_id: order.orderId,
        theme: { color: "#ff9933" },
        modal: { ondismiss: () => setSubmitting(null) },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verify = await verifyRes.json();
            if (verify.verified) {
              setResult({
                kind: "success",
                paymentId: response.razorpay_payment_id,
                amount: order.rupeeAmount,
                persisted: verify.persisted !== false,
              });
            } else {
              setResult({ kind: "error", message: "Payment could not be verified. Contact support with your payment id." });
            }
          } finally {
            setSubmitting(null);
          }
        },
      });
      rzp.open();
    } catch {
      setResult({ kind: "error", message: "Something went wrong starting checkout." });
      setSubmitting(null);
    }
  }

  if (mode === "locked" && listing.lockedUntil) {
    return (
      <div className="rounded-2xl border border-gold/40 bg-gold/10 p-5 text-center text-sm text-foreground/85">
        🔒 {listing.title} is locked at #1 until{" "}
        {new Date(listing.lockedUntil).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
        , immune to being outbid.
      </div>
    );
  }

  if (result?.kind === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-india-green/40 bg-india-green/10 p-8 text-center">
        <span className="text-3xl">✅</span>
        <h2 className="text-lg font-bold text-foreground">Payment successful</h2>
        <p className="text-sm text-foreground/80">
          {formatRupees(result.amount)} paid for {listing.title}. Payment id: {result.paymentId}
        </p>
        {result.persisted ? (
          <p className="text-xs text-muted">
            The leaderboard has been updated. {listing.title} now reflects this bid.
          </p>
        ) : (
          <p className="text-xs text-danger">
            The charge went through, but updating the leaderboard failed. Contact support with your
            payment id above and we&apos;ll sort out the rank manually.
          </p>
        )}
        <Link
          href={`/listing/${listing.slug}`}
          className="mt-2 rounded-full bg-saffron px-5 py-2 text-sm font-bold text-black"
        >
          View listing
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {mode === "leader" ? (
        <div className="rounded-2xl border border-india-green/40 bg-india-green/10 p-4 text-sm text-foreground/85">
          {listing.title} is already #1 on this board. You can raise your bid to build a bigger lead,
          or lock the spot below.
        </div>
      ) : mode === "reclaim" ? (
        <div className="rounded-2xl border border-saffron/40 bg-saffron/10 p-4 text-sm text-foreground/85">
          {listing.title} was outranked. Reclaiming only costs the gap to the new leader plus ₹10,
          not a fresh full bid.
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-surface p-6 text-center">
        <span className="text-xs font-semibold tracking-wide text-muted uppercase">Your bid</span>
        <div className="flex items-center gap-4">
          <StepButton
            label="−"
            onClick={() => setAmountClamped(amount - BID_INCREMENT)}
            disabled={amount <= minRequired}
          />
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground">₹</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onBlur={commitTypedAmount}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitTypedAmount();
                }
              }}
              style={{ width: `${Math.max(amountInput.length, 2) + 1}ch` }}
              className="min-w-0 border-b-2 border-border bg-transparent text-center text-4xl font-black tabular-nums text-foreground outline-none focus:border-saffron"
              aria-label="Bid amount in rupees"
            />
          </div>
          <StepButton
            label="+"
            onClick={() => setAmountClamped(amount + BID_INCREMENT)}
            disabled={atMax}
          />
        </div>
        {atMax ? (
          <span className="text-xs font-semibold text-saffron">
            Maximum bid reached: {formatRupees(MAX_BID)} is the highest amount you can bid.
          </span>
        ) : (
          <span className="text-xs text-muted">
            Minimum required: {formatRupees(minRequired)} · ₹{BID_INCREMENT} increments · type to enter a
            custom amount
          </span>
        )}

        <div className="flex gap-2">
          {QUICK_ADDS.map((add) => (
            <button
              key={add}
              type="button"
              onClick={() => setAmountClamped(amount + add)}
              disabled={atMax}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground/80"
            >
              +{formatRupees(add)}
            </button>
          ))}
        </div>
      </div>

      {!PAYMENTS_ENABLED && (
        <div className="flex flex-col items-center gap-1 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-center text-sm">
          <span className="font-semibold text-gold">
            ⏸️ Payments are temporarily disabled. Please check back soon.
          </span>
          <span className="text-xs font-medium text-foreground/70">
            You can still{" "}
            <Link href="/submit" className="underline hover:text-foreground">
              list your business on IndiaBid for free
            </Link>
            .
          </span>
        </div>
      )}

      <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-sm text-foreground/85">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-saffron"
        />
        <span>
          I understand my rank is not guaranteed if I get outbid later, and that this payment is final,
          with no refunds for rank changes.
        </span>
      </label>

      {result?.kind === "error" && (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-3 text-center text-sm text-danger">
          {result.message}
        </div>
      )}

      <button
        type="button"
        disabled={!canSubmit || submitting !== null}
        onClick={() => pay(false)}
        className="rounded-full bg-saffron px-6 py-3.5 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting === "bid" ? "Opening checkout…" : `Pay ${formatRupees(amount)} via Razorpay`}
      </button>
      <span className="-mt-4 text-center text-xs text-muted">
        UPI, cards, and netbanking accepted (test mode) · 10% of this bid goes to underprivileged kids&apos;
        education
      </span>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-gold/50 bg-gold/5 p-4">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Lock #1 for {PREMIUM_LOCK_HOURS}h
          </div>
          <div className="text-xs text-muted">Immune to being outbid during the window</div>
        </div>
        <button
          type="button"
          disabled={!consented || submitting !== null || !PAYMENTS_ENABLED}
          onClick={() => pay(true)}
          className="shrink-0 rounded-full border border-gold px-4 py-2 text-xs font-bold text-gold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting === "lock" ? "Opening…" : formatRupees(lockAmount)}
        </button>
      </div>
    </div>
  );
}

function StepButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-lg font-bold text-foreground transition-colors hover:border-saffron hover:text-saffron disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
    >
      {label}
    </button>
  );
}
