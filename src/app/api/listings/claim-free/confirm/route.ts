import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/", request.url));

  const supabase = createServiceSupabaseClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, owner_contact, owner_magic_token, pending_owner_email, pending_owner_token_expires_at")
    .eq("pending_owner_token", token)
    .maybeSingle();

  if (error || !listing) {
    return NextResponse.redirect(new URL("/?error=invalid-link", request.url));
  }

  const expired =
    !listing.pending_owner_token_expires_at || new Date(listing.pending_owner_token_expires_at) < new Date();
  if (expired) {
    return NextResponse.redirect(new URL(`/claim/${listing.id}?error=link-expired`, request.url));
  }

  // If someone else claimed this listing after the link was sent (e.g. two
  // people raced to claim it), don't let a stale link grant access.
  if (listing.owner_contact && listing.owner_contact !== listing.pending_owner_email) {
    return NextResponse.redirect(new URL(`/claim/${listing.id}?error=link-expired`, request.url));
  }

  await supabase
    .from("listings")
    .update({
      owner_contact: listing.pending_owner_email,
      pending_owner_email: null,
      pending_owner_token: null,
      pending_owner_token_expires_at: null,
      pending_owner_requested_at: null,
    })
    .eq("id", listing.id);

  return NextResponse.redirect(new URL(`/dashboard/${listing.owner_magic_token}`, request.url));
}
