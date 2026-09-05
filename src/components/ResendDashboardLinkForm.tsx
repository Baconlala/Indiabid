"use client";

import { useState, type FormEvent } from "react";

type Props = {
  listingId: string;
  domain: string;
};

export default function ResendDashboardLinkForm({ listingId, domain }: Props) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/listings/owner/resend-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, contact: contact.trim() }),
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted underline hover:text-foreground"
      >
        Lost your dashboard link?
      </button>
    );
  }

  if (sent) {
    return (
      <p className="text-xs text-foreground/80">
        If that email owns this listing, we&apos;ve sent a dashboard link to it — check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        aria-label="Verified email to resend your dashboard link"
        placeholder={`name@${domain}`}
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted focus:border-india-green"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-foreground/80 transition-opacity hover:border-india-green disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Resend link"}
      </button>
    </form>
  );
}
