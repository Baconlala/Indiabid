"use client";

import { useAgeGate } from "@/lib/age-gate-context";

export default function AgeGateBanner() {
  const { consent, setConsent } = useAgeGate();
  if (consent !== null) return null;

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3 text-center sm:flex-row sm:justify-between sm:gap-3 sm:p-4 sm:text-left">
      <p className="text-xs text-foreground/85 sm:text-sm">
        This board can include 18+ listings (adult category). Show them?
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setConsent("declined")}
          className="rounded-full border border-border px-3.5 py-1 text-xs font-semibold text-foreground/80 hover:border-saffron sm:px-4 sm:py-1.5 sm:text-sm"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={() => setConsent("accepted")}
          className="rounded-full bg-saffron px-3.5 py-1 text-xs font-bold text-black sm:px-4 sm:py-1.5 sm:text-sm"
        >
          Yes, I&apos;m 18+
        </button>
      </div>
    </div>
  );
}
