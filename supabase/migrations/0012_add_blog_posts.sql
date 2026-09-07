create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null, -- markdown
  cover_image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index blog_posts_published_idx on blog_posts (published_at desc) where published;

-- Only the published, public fields are ever readable by anon/authenticated —
-- admin writes go through the service role, same pattern as listings.
create view blog_posts_public as
  select id, slug, title, excerpt, content, cover_image_url, published_at
  from blog_posts
  where published;

grant select on blog_posts_public to anon, authenticated;
