import type { Listing } from "./types";

const REFERRERS = ["Direct", "Google", "WhatsApp", "Twitter / X", "Instagram", "LinkedIn"];

// Deterministic seeded PRNG so the demo click log is stable across renders.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h;
}

export type ClickEvent = { timestamp: string; referrer: string };

export function generateClickLog(listing: Listing): ClickEvent[] {
  const rand = mulberry32(seedFromId(listing.id));
  const createdAt = new Date(listing.createdAt).getTime();
  const now = Date.now();
  const span = Math.max(now - createdAt, 60 * 60 * 1000);

  const events: ClickEvent[] = [];
  for (let i = 0; i < listing.clickCount; i++) {
    const t = createdAt + rand() * span;
    const referrer = REFERRERS[Math.floor(rand() * REFERRERS.length)];
    events.push({ timestamp: new Date(t).toISOString(), referrer });
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function clicksByDay(events: ClickEvent[], days: number): { day: string; count: number }[] {
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const e of events) {
    const key = e.timestamp.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([day, count]) => ({ day, count }));
}
