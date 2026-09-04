import type { ActivityEvent, Listing } from "@/lib/types";
import { formatRupees, timeAgo } from "@/lib/format";

type Props = {
  events: ActivityEvent[];
  listingById: (id: string) => Listing | undefined;
};

const LABEL: Record<ActivityEvent["eventType"], (title: string) => string> = {
  listing_created: (title) => `${title} was added`,
  bid_placed: (title) => `${title} took the lead`,
  rank_reclaimed: (title) => `${title} reclaimed their rank`,
  top_locked: (title) => `${title} locked in #1 for 3h`,
};

export default function ActivityFeed({ events, listingById }: Props) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((event) => {
        const listing = listingById(event.listingId);
        if (!listing) return null;
        return (
          <li key={event.id} className="flex items-center gap-3 text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
            <span className="min-w-0 flex-1 truncate text-foreground/85">
              {LABEL[event.eventType](listing.title)}
              {event.amount ? (
                <span className="text-muted"> · {formatRupees(event.amount)}</span>
              ) : null}
            </span>
            <span className="shrink-0 text-xs text-muted">{timeAgo(event.timestamp)}</span>
          </li>
        );
      })}
    </ul>
  );
}
