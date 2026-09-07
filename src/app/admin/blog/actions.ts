"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { slugify } from "@/lib/submission";
import { createServiceSupabaseClient } from "@/lib/supabase";

// Defense in depth — middleware already gates /admin/*, but a server action
// can in principle be invoked directly, so check again here too.
async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await isValidAdminSession(session))) redirect("/admin/login");
}

export async function savePost(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const published = formData.get("published") === "on";
  let slug = String(formData.get("slug") ?? "").trim();

  if (!title || !excerpt || !content) {
    redirect(`/admin/blog/${id || "new"}?error=missing`);
  }
  if (!slug) slug = slugify(title);

  const supabase = createServiceSupabaseClient();
  const basePayload = {
    title,
    slug,
    excerpt,
    content,
    cover_image_url: coverImageUrl || null,
    published,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    const published_at = published ? (existing?.published_at ?? new Date().toISOString()) : null;
    const { error } = await supabase
      .from("blog_posts")
      .update({ ...basePayload, published_at })
      .eq("id", id);
    if (error) redirect(`/admin/blog/${id}?error=save`);
  } else {
    const published_at = published ? new Date().toISOString() : null;
    const { error } = await supabase.from("blog_posts").insert({ ...basePayload, published_at });
    if (error) redirect(`/admin/blog/new?error=save`);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  redirect("/admin/blog");
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createServiceSupabaseClient();
  await supabase.from("blog_posts").delete().eq("id", id);
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
