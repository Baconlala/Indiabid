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

for (const table of ["cities", "categories", "listings", "activity_feed"]) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  console.log(table, error ? `ERROR: ${error.message}` : `${count} rows`);
}

const { data: sample, error: sampleErr } = await supabase
  .from("listings")
  .select("title, current_bid, is_claimed, city_id")
  .order("current_bid", { ascending: false })
  .limit(5);
console.log("top 5 by bid:", sampleErr ? sampleErr.message : JSON.stringify(sample, null, 2));

const { error: viewErr } = await supabase.from("listings_public").select("id").limit(1);
console.log("listings_public view accessible:", viewErr ? viewErr.message : true);
