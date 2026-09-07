import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

const APOSTROPHES = /['’]/g;

function slugify(text) {
  const base = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(APOSTROPHES, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return base || "listing";
}

async function main() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("id, title, slug")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const taken = new Set();
  const updates = [];
  for (const l of listings) {
    if (l.slug) {
      taken.add(l.slug);
      continue;
    }
    const base = slugify(l.title);
    let slug = base;
    let n = 2;
    while (taken.has(slug)) slug = `${base}-${n++}`;
    taken.add(slug);
    updates.push({ id: l.id, title: l.title, slug });
  }

  if (updates.length === 0) {
    console.log("Nothing to backfill — every active listing already has a slug.");
    return;
  }

  console.log(`Backfilling ${updates.length} slugs...`);
  for (const u of updates) {
    const { error: updErr } = await supabase.from("listings").update({ slug: u.slug }).eq("id", u.id);
    if (updErr) {
      console.error(`Failed for "${u.title}" (${u.id}):`, updErr.message);
    } else {
      console.log(`${u.title} -> ${u.slug}`);
    }
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
