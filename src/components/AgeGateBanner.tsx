"use client";

import { useAgeGate } from "@/lib/age-gate-context";

export default function AgeGateBanner() {
  const { adultUnlocked, setConsent } = useAgeGate();
  if (adultUnlocked) return null;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="text-sm text-foreground/85">
        This board can include 18+ listings (adult category). Show them?
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setConsent("declined")}
          className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground/80 hover:border-saffron"
        >
          No thanks
        </button>
        <button
          type="button"
          onClick={() => setConsent("accepted")}
          className="rounded-full bg-saffron px-4 py-1.5 text-sm font-bold text-black"
        >
          Yes, I&apos;m 18+
        </button>
      </div>
    </div>
  );
}
