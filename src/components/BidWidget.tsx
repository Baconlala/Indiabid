import { formatRupees } from "@/lib/format";

type Props = {
  boardLabel: string;
  minBid: number;
  hasLeader: boolean;
};

export default function BidWidget({ boardLabel, minBid, hasLeader }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-saffron/30 bg-gradient-to-b from-saffron/10 to-transparent p-6 text-center sm:p-8">
      <span className="text-xs font-semibold tracking-wide text-muted uppercase">
        {boardLabel} board
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black tabular-nums text-foreground sm:text-6xl">
          {formatRupees(minBid)}
        </span>
        <span className="text-lg font-semibold text-muted sm:text-xl">to claim #1</span>
      </div>
      <p className="max-w-md text-sm text-muted">
        {hasLeader
          ? "Beat the current #1's total spend to take the top spot."
          : "No one has claimed #1 yet on this board — be first."}
      </p>
      <button
        type="button"
        disabled
        title="Checkout flow is coming in the next step"
        className="mt-2 rounded-full bg-saffron px-8 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        Claim #1 for {formatRupees(minBid)}
      </button>
      <span className="text-xs text-muted">Min bid ₹21 · ₹10 increments · UPI, cards, netbanking</span>
    </div>
  );
}
