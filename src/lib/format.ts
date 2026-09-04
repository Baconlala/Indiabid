const rupeeGrouped = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

/** Full amount with Indian digit grouping, e.g. ₹1,23,456 */
export function formatRupees(amount: number): string {
  return `₹${rupeeGrouped.format(amount)}`;
}

/** Abbreviated lakh/crore form for site-wide stats, e.g. ₹42.5 L, ₹3.2 Cr */
export function formatLakhCrore(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(2)} L`;
  }
  if (abs >= 1_000) {
    return `₹${(amount / 1_000).toFixed(1)} K`;
  }
  return `₹${amount}`;
}

export function formatCount(count: number): string {
  return new Intl.NumberFormat("en-IN").format(count);
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
