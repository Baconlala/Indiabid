import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getBlogPosts } from "@/lib/blog";
import { timeAgo } from "@/lib/format";

// New posts should show up right away, not wait for a rebuild.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog · IndiaBid",
  description: "Notes on ranking, pay-to-rank strategy, and building IndiaBid in public.",
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <Header />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-8 pb-16 sm:px-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Blog</h1>
          <p className="text-sm text-muted">Notes on ranking, growth, and building IndiaBid in public.</p>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-muted">No posts yet — check back soon.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-5 transition-colors hover:border-saffron/40"
              >
                {post.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImageUrl} alt="" className="h-40 w-full rounded-2xl object-cover" />
                )}
                <h2 className="text-lg font-bold text-foreground">{post.title}</h2>
                <p className="line-clamp-2 text-sm text-muted">{post.excerpt}</p>
                <span className="text-xs text-muted">{timeAgo(post.publishedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
