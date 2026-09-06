import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { isClaimEmailRateLimited, recordClaimEmailRequest } from "@/lib/claim-rate-limit";
import { sendOwnershipEmail } from "@/lib/email";
import { getClientIp } from "@/lib/submission";

const TOKEN_TTL_MS = 30 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const listingId = body?.listingId;
  const contact = String(body?.contact ?? "").trim().toLowerCase();

  if (typeof listingId !== "string" || !contact) {
    return NextResponse.json({ error: "listingId and contact are required." }, { status: 400 });
  }

  const ip = getClientIp(request);
  if (await isClaimEmailRateLimited(ip)) {
    return NextResponse.json({ sent: true });
  }

  const supabase = createServiceSupabaseClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, owner_contact, pending_owner_requested_at")
    .eq("id", listingId)
    .maybeSingle();

  // Always report success, whether or not the email actually owns this
  // listing — otherwise this endpoint would let anyone probe who owns it.
  const generic = NextResponse.json({ sent: true });

  if (!listing || !listing.owner_contact || listing.owner_contact !== contact) {
    return generic;
  }
  if (
    listing.pending_owner_requested_at &&
    Date.now() - new Date(listing.pending_owner_requested_at).getTime() < RESEND_COOLDOWN_MS
  ) {
    return generic;
  }

  const token = crypto.randomUUID();
  const now = new Date();
  await supabase
    .from("listings")
    .update({
      pending_owner_email: contact,
      pending_owner_token: token,
      pending_owner_token_expires_at: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
      pending_owner_requested_at: now.toISOString(),
    })
    .eq("id", listing.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.vercel.app";
  const confirmUrl = `${siteUrl}/api/listings/claim-free/confirm?token=${token}`;

  await recordClaimEmailRequest(ip);

  try {
    await sendOwnershipEmail(contact, { confirmUrl, listingTitle: listing.title, isNewClaim: false });
  } catch {
    // Still return generic success — don't let a send failure leak enumeration info.
  }

  return generic;
}
