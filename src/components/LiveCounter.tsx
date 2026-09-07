"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

// "Online now" via Supabase Realtime Presence — each tab joins a shared
// channel and the count is just how many presences are currently tracked.
// No polling, no extra service (outbid.lol pays for a third-party analytics
// tool for this; this rides on infra we already have).
export default function LiveCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    const channel = supabase.channel("site-presence", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (count === null) return null;

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-india-green opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-india-green" />
      </span>
      {count} online
    </span>
  );
}
