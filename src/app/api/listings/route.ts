import { NextResponse } from "next/server";
import { createListing } from "@/lib/create-listing";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getClientIp, isValidIndianPhone } from "@/lib/submission";

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Malformed form data." }, { status: 400 });
  }

  const url = String(form.get("url") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const categoryId = String(form.get("categoryId") ?? "").trim();
  const cityIdRaw = String(form.get("cityId") ?? "").trim();
  const cityId = cityIdRaw.length > 0 ? cityIdRaw : null;
  const phone = String(form.get("phone") ?? "").replace(/\D/g, "").slice(-10);
  const screenshot = form.get("screenshot");

  if (!url || !title || !description || !categoryId) {
    return NextResponse.json({ error: "URL, title, description, and category are required." }, { status: 400 });
  }
  if (title.length > 80) {
    return NextResponse.json({ error: "Title is too long (max 80 characters)." }, { status: 400 });
  }
  if (description.length > 300) {
    return NextResponse.json({ error: "Description is too long (max 300 characters)." }, { status: 400 });
  }
  if (!isValidIndianPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  let uploadedScreenshot: { path: string; publicUrl: string } | null = null;
  if (screenshot instanceof File && screenshot.size > 0) {
    if (screenshot.size > MAX_SCREENSHOT_BYTES) {
      return NextResponse.json({ error: "Screenshot must be under 5MB." }, { status: 400 });
    }
    if (!screenshot.type.startsWith("image/")) {
      return NextResponse.json({ error: "Screenshot must be an image." }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();
    const ext = screenshot.name.split(".").pop() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("listing-screenshots")
      .upload(path, screenshot, { contentType: screenshot.type });
    if (uploadErr) {
      return NextResponse.json({ error: "Could not upload screenshot. Please try again." }, { status: 502 });
    }
    const { data: publicUrlData } = supabase.storage.from("listing-screenshots").getPublicUrl(path);
    uploadedScreenshot = { path, publicUrl: publicUrlData.publicUrl };
  }

  const result = await createListing({
    url,
    title,
    description,
    categoryId,
    cityId,
    phone,
    submitterIp: getClientIp(request),
    screenshot: uploadedScreenshot,
  });

  switch (result.status) {
    case "created":
      return NextResponse.json({ listingId: result.listingId, pendingReview: result.pendingReview });
    case "duplicate":
      return NextResponse.json(
        {
          error: `This is already listed as "${result.existingTitle}".`,
          existingListingId: result.existingListingId,
        },
        { status: 409 }
      );
    case "rate_limited":
      return NextResponse.json({ error: result.reason }, { status: 429 });
    case "error":
      return NextResponse.json({ error: result.message }, { status: 400 });
  }
}
