import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { emailMatchesListingDomain } from "@/lib/submission";

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

  const supabase = createServiceSupabaseClient();

  const { data: listing, error: fetchErr } = await supabase
    .from("listings")
    .select("id, url, owner_contact")
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

  const { data: updated, error: updateErr } = await supabase
    .from("listings")
    .update({ owner_contact: contact })
    .eq("id", listingId)
    .select("owner_magic_token")
    .single();
  if (updateErr || !updated) {
    return NextResponse.json({ error: "Could not save your claim. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ dashboardToken: updated.owner_magic_token });
}
