export type CategoryGroup =
  | "AI"
  | "Software"
  | "Growth"
  | "Money"
  | "Sectors"
  | "People";

export type Category = {
  id: string;
  name: string;
  slug: string;
  group: CategoryGroup;
  icon: string;
  isSensitive: boolean;
};

export type City = {
  id: string;
  name: string;
  slug: string;
};

export type Listing = {
  id: string;
  url: string;
  title: string;
  description: string;
  categoryId: string;
  cityId: string | null;
  currentBid: number;
  isClaimed: boolean;
  isLocked: boolean;
  lockedUntil: string | null;
  ownerContact: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  clickCount: number;
  createdAt: string;
  lastBidAt: string | null;
  isActive: boolean;
};

export type ActivityEventType =
  | "listing_created"
  | "bid_placed"
  | "rank_reclaimed"
  | "top_locked";

export type ActivityEvent = {
  id: string;
  listingId: string;
  eventType: ActivityEventType;
  amount: number | null;
  timestamp: string;
};
