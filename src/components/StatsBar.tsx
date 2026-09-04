import { formatCount, formatLakhCrore } from "@/lib/format";

type Props = {
  totalRaised: number;
  totalListings: number;
  claimedListings: number;
  totalClicks: number;
  charityDonated: number;
};

export default function StatsBar({
  totalRaised,
  totalListings,
  claimedListings,
  totalClicks,
  charityDonated,
}: Props) {
  const stats = [
    { label: "Total paid to rank", value: formatLakhCrore(totalRaised) },
    { label: "Listings live", value: formatCount(totalListings) },
    { label: "Ranks claimed", value: formatCount(claimedListings) },
    { label: "Verified clicks", value: formatCount(totalClicks) },
    { label: "Donated to kids' education", value: formatLakhCrore(charityDonated), highlight: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border p-4 text-center ${
            stat.highlight ? "border-india-green/40 bg-india-green/10" : "border-border bg-surface"
          }`}
        >
          <div
            className={`text-2xl font-bold tabular-nums sm:text-3xl ${
              stat.highlight ? "text-india-green" : "text-foreground"
            }`}
          >
            {stat.value}
          </div>
          <div className="mt-1 text-xs text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
