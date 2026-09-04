import { minimumBidToTakeLead, reclaimAmount } from "./bidding";
import type { Listing } from "./types";

export type ClaimMode = "claim" | "reclaim" | "leader" | "locked";

export type ClaimRequirement = {
  mode: ClaimMode;
  minRequired: number;
  currentLeaderBid: number;
};

/**
 * Server-computed requirement — the amount a client submits is never trusted
 * on its own. `board` is every listing already ranked on the same board
 * (national or a specific city) as `listing`, including `listing` itself.
 */
export function computeClaimRequirement(listing: Listing, board: Listing[]): ClaimRequirement {
  const leader = board[0];
  const isLeader = leader?.id === listing.id;

  const isLocked =
    listing.isLocked && listing.lockedUntil != null && new Date(listing.lockedUntil).getTime() > Date.now();

  const currentLeaderBid = isLeader ? (board[1]?.currentBid ?? 0) : (leader?.currentBid ?? 0);

  if (isLocked) {
    return { mode: "locked", minRequired: 0, currentLeaderBid };
  }
  if (isLeader) {
    return { mode: "leader", minRequired: minimumBidToTakeLead(currentLeaderBid), currentLeaderBid };
  }
  if (listing.currentBid > 0) {
    return {
      mode: "reclaim",
      minRequired: reclaimAmount(listing.currentBid, leader.currentBid),
      currentLeaderBid,
    };
  }
  return { mode: "claim", minRequired: minimumBidToTakeLead(currentLeaderBid), currentLeaderBid };
}
