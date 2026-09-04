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

const { data, error } = await supabase.storage.createBucket("listing-screenshots", {
  public: true,
  fileSizeLimit: 5242880,
  allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
});

if (error) {
  if (error.message?.includes("already exists")) {
    console.log("Bucket already exists, fine.");
  } else {
    console.error(error);
    process.exit(1);
  }
} else {
  console.log("Bucket created:", data);
}
