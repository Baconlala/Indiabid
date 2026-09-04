import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { isValidIndianPhone } from "@/lib/submission";

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const listingId = body?.listingId;
  const contact = String(body?.contact ?? "").trim();

  if (typeof listingId !== "string" || !contact) {
    return NextResponse.json({ error: "listingId and contact are required." }, { status: 400 });
  }
  if (!isValidEmail(contact) && !isValidIndianPhone(contact.replace(/\D/g, "").slice(-10))) {
    return NextResponse.json({ error: "Enter a valid email or 10-digit phone number." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  const { data: listing, error: fetchErr } = await supabase
    .from("listings")
    .select("id, owner_contact")
    .eq("id", listingId)
    .maybeSingle();
  if (fetchErr || !listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.owner_contact) {
    return NextResponse.json({ error: "This listing has already been claimed." }, { status: 409 });
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
