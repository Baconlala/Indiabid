import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { deletePost, savePost } from "../actions";

export const dynamic = "force-dynamic";

const inputClass =
  "rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-saffron";

export default async function AdminBlogEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const isNew = id === "new";

  let post: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image_url: string | null;
    published: boolean;
  } | null = null;

  if (!isNew) {
    const supabase = createServiceSupabaseClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, content, cover_image_url, published")
      .eq("id", id)
      .maybeSingle();
    if (!data) notFound();
    post = data;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Link href="/admin/blog" className="text-sm text-muted hover:text-foreground">
        ← All posts
      </Link>
      <h1 className="text-xl font-black text-foreground">{isNew ? "New post" : "Edit post"}</h1>

      {error === "missing" && (
        <p className="text-sm text-danger">Title, excerpt, and content are all required.</p>
      )}
      {error === "save" && <p className="text-sm text-danger">Could not save. Please try again.</p>}

      <form action={savePost} className="flex flex-col gap-4">
        {!isNew && <input type="hidden" name="id" value={id} />}

        <Field label="Title">
          <input name="title" defaultValue={post?.title} required className={inputClass} />
        </Field>

        <Field label="Slug (leave blank to auto-generate from title)">
          <input name="slug" defaultValue={post?.slug} placeholder="auto" className={inputClass} />
        </Field>

        <Field label="Excerpt (shown on the blog listing page)">
          <textarea name="excerpt" defaultValue={post?.excerpt} required rows={2} className={inputClass} />
        </Field>

        <Field label="Cover image URL (optional)">
          <input
            name="coverImageUrl"
            defaultValue={post?.cover_image_url ?? ""}
            placeholder="https://..."
            className={inputClass}
          />
        </Field>

        <Field label="Content (Markdown)">
          <textarea
            name="content"
            defaultValue={post?.content}
            required
            rows={18}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-foreground/85">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.published}
            className="h-4 w-4 accent-saffron"
          />
          Published (visible on the public blog)
        </label>

        <button
          type="submit"
          className="rounded-full bg-saffron px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          Save
        </button>
      </form>

      {!isNew && (
        <form action={deletePost} className="self-start">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-sm text-danger hover:underline">
            Delete post
          </button>
        </form>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground/85">
      {label}
      {children}
    </label>
  );
}
