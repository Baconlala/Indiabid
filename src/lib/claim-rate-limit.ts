import { createServiceSupabaseClient } from "./supabase";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP_PER_WINDOW = 10;

/** Whether this IP has already sent MAX_PER_IP_PER_WINDOW ownership-verification emails in the last hour. */
export async function isClaimEmailRateLimited(ip: string): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("claim_email_requests")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", windowStart);
  return (count ?? 0) >= MAX_PER_IP_PER_WINDOW;
}

export async function recordClaimEmailRequest(ip: string): Promise<void> {
  const supabase = createServiceSupabaseClient();
  await supabase.from("claim_email_requests").insert({ ip });
}
