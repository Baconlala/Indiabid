import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { isClaimEmailRateLimited, recordClaimEmailRequest } from "@/lib/claim-rate-limit";
import { RESEND_COOLDOWN_MS, TOKEN_TTL_MS } from "@/lib/claim-tokens";
import { sendOwnershipEmail } from "@/lib/email";
import { emailMatchesListingDomain, getClientIp } from "@/lib/submission";

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const listingId = body?.listingId;
  const contact = String(body?.contact ?? "").trim().toLowerCase();

  if (typeof listingId !== "string" || !contact) {
    return NextResponse.json({ error: "listingId and contact are required." }, { status: 400 });
  }
  // Ownership is verified by domain match, which only an email can prove —
  // a phone number carries no signal that it belongs to the site's owner.
  if (!isValidEmail(contact)) {
    return NextResponse.json(
      { error: "Enter an email address — this is how we verify you're affiliated with the listing." },
      { status: 400 }
    );
  }

  // This sends an email to an address the requester hasn't proven they own —
  // rate-limit by IP so it can't be used to blast confirmation-shaped emails.
  const ip = getClientIp(request);
  if (await isClaimEmailRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many verification requests from this connection. Try again later." },
      { status: 429 }
    );
  }

  const supabase = createServiceSupabaseClient();

  const { data: listing, error: fetchErr } = await supabase
    .from("listings")
    .select("id, url, title, owner_contact, pending_owner_requested_at")
    .eq("id", listingId)
    .maybeSingle();
  if (fetchErr || !listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.owner_contact) {
    return NextResponse.json({ error: "This listing has already been claimed." }, { status: 409 });
  }

  if (!emailMatchesListingDomain(contact, listing.url)) {
    let listingDomain = "the listing's website";
    try {
      listingDomain = new URL(listing.url).hostname.replace(/^www\./, "");
    } catch {
      // keep the generic fallback text
    }
    return NextResponse.json(
      {
        error: `We can only verify ownership through an email at ${listingDomain} (e.g. name@${listingDomain}) — a personal or unrelated email won't work.`,
      },
      { status: 403 }
    );
  }

  if (
    listing.pending_owner_requested_at &&
    Date.now() - new Date(listing.pending_owner_requested_at).getTime() < RESEND_COOLDOWN_MS
  ) {
    return NextResponse.json(
      { error: "We just sent a verification link — check your inbox (and spam folder) before requesting another." },
      { status: 429 }
    );
  }

  const token = crypto.randomUUID();
  const now = new Date();
  const { error: updateErr } = await supabase
    .from("listings")
    .update({
      pending_owner_email: contact,
      pending_owner_token: token,
      pending_owner_token_expires_at: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
      pending_owner_requested_at: now.toISOString(),
    })
    .eq("id", listingId);
  if (updateErr) {
    return NextResponse.json({ error: "Could not start verification. Please try again." }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://indiabid.vercel.app";
  const confirmUrl = `${siteUrl}/api/listings/claim-free/confirm?token=${token}`;

  await recordClaimEmailRequest(ip);

  try {
    await sendOwnershipEmail(contact, { confirmUrl, listingTitle: listing.title, isNewClaim: true });
  } catch {
    return NextResponse.json(
      { error: "Could not send the verification email. Please try again shortly." },
      { status: 500 }
    );
  }

  return NextResponse.json({ pending: true, email: contact });
}
