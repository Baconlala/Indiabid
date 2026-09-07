import { createBrowserSupabaseClient } from "./supabase";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string;
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  published_at: string;
};

function mapPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
  };
}

// PGRST205 = PostgREST doesn't know this table/view at all (its schema
// cache), 42P01 = raw Postgres "relation does not exist" — either way,
// migration 0012 hasn't been applied yet. Fail soft so the blog pages render
// an empty state instead of 500ing.
function isMissingTable(error: { code?: string }): boolean {
  return error.code === "PGRST205" || error.code === "42P01";
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts_public")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []).map(mapPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return data ? mapPost(data) : null;
}
