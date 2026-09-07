import Link from "next/link";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBlogListPage() {
  const supabase = createServiceSupabaseClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">Blog admin</h1>
        <form action={logout}>
          <button type="submit" className="text-sm text-muted hover:text-foreground">
            Log out
          </button>
        </form>
      </div>

      <Link
        href="/admin/blog/new"
        className="self-start rounded-full bg-saffron px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
      >
        + New post
      </Link>

      <div className="flex flex-col gap-2">
        {(posts ?? []).map((p) => (
          <Link
            key={p.id}
            href={`/admin/blog/${p.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-saffron/40"
          >
            <div className="min-w-0">
              <div className="truncate font-semibold text-foreground">{p.title}</div>
              <div className="text-xs text-muted">/blog/{p.slug}</div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                p.published ? "bg-india-green/15 text-india-green" : "bg-surface-raised text-muted"
              }`}
            >
              {p.published ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
        {(posts ?? []).length === 0 && <p className="text-sm text-muted">No posts yet.</p>}
      </div>
    </main>
  );
}
