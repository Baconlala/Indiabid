export const MIN_BID = 21;
export const BID_INCREMENT = 10;
export const PREMIUM_LOCK_MULTIPLIER = 5;
export const PREMIUM_LOCK_HOURS = 3;
export const CHARITY_SHARE = 0.1;

export function isValidBidAmount(amount: number): boolean {
  return (
    Number.isInteger(amount) &&
    amount >= MIN_BID &&
    (amount - MIN_BID) % BID_INCREMENT === 0
  );
}

/**
 * A required amount (e.g. a reclaim delta) isn't always on the global ₹21
 * sequence itself — what must hold is that it's `minRequired` plus zero or
 * more ₹10 steps, so the resulting total stays on-sequence.
 */
export function isValidBidStep(amount: number, minRequired: number): boolean {
  return Number.isInteger(amount) && amount >= minRequired && (amount - minRequired) % BID_INCREMENT === 0;
}

/** Smallest valid bid (in the ₹21, ₹31, ₹41… sequence) that beats currentTopBid. */
export function minimumBidToTakeLead(currentTopBid: number): number {
  if (currentTopBid <= 0) return MIN_BID;
  const steps = Math.floor((currentTopBid - MIN_BID) / BID_INCREMENT) + 1;
  return MIN_BID + steps * BID_INCREMENT;
}

/** Reclaiming only costs the gap to the new leader plus ₹10, not a fresh full bid. */
export function reclaimAmount(lastBid: number, newLeaderBid: number): number {
  return Math.max(newLeaderBid - lastBid + BID_INCREMENT, BID_INCREMENT);
}

export function premiumLockAmount(currentTopBid: number): number {
  const base = Math.max(currentTopBid, MIN_BID);
  return base * PREMIUM_LOCK_MULTIPLIER;
}

/** 10% of every rupee raised is pledged to underprivileged kids' education. */
export function charityAmount(totalRaised: number): number {
  return Math.round(totalRaised * CHARITY_SHARE);
}
