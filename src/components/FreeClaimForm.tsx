"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Props = {
  listingId: string;
  listingTitle: string;
};

type Result = { kind: "success"; dashboardToken: string } | { kind: "error"; message: string };

export default function FreeClaimForm({ listingId, listingTitle }: Props) {
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/listings/claim-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, contact: contact.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ kind: "success", dashboardToken: data.dashboardToken });
      } else {
        setResult({ kind: "error", message: data.error ?? "Something went wrong." });
      }
    } catch {
      setResult({ kind: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.kind === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-india-green/40 bg-india-green/10 p-6 text-center">
        <span className="text-2xl">✅</span>
        <h3 className="font-bold text-foreground">You own {listingTitle} now</h3>
        <p className="text-sm text-foreground/80">
          No payment was involved — this is free. Here&apos;s your dashboard link, keep it private:
        </p>
        <Link
          href={`/dashboard/${result.dashboardToken}`}
          className="rounded-full bg-india-green px-5 py-2.5 text-sm font-bold text-black"
        >
          Open dashboard
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-3xl border border-india-green/40 bg-india-green/10 p-5"
    >
      <div>
        <h3 className="font-bold text-foreground">Is {listingTitle} yours?</h3>
        <p className="text-sm text-foreground/80">
          Claim it for free to get access to its click-log dashboard. This doesn&apos;t cost anything
          and doesn&apos;t change its rank — ranking is a separate, optional step below.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          required
          placeholder="Email or 10-digit phone"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-india-green"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-india-green px-5 py-2.5 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Claiming…" : "Claim it free"}
        </button>
      </div>
      {result?.kind === "error" && <p className="text-sm text-danger">{result.message}</p>}
    </form>
  );
}
