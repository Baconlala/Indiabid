-- IndiaBid core schema: cities, categories, listings, payments, clicks, activity feed.
create extension if not exists "pgcrypto";

create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  "group" text not null check (
    "group" in ('AI', 'Software', 'Growth', 'Money', 'Sectors', 'People')
  ),
  icon text not null default '',
  is_sensitive boolean not null default false,
  created_at timestamptz not null default now()
);

create table listings (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  -- URL with UTM/tracking params stripped, used for submission dedupe.
  normalized_url text not null,
  title text not null,
  description text not null,
  category_id uuid not null references categories (id),
  city_id uuid references cities (id), -- null = national board
  current_bid integer not null default 0 check (current_bid >= 0),
  is_claimed boolean not null default false,
  is_locked boolean not null default false,
  locked_until timestamptz,
  owner_contact text,
  -- Unguessable token used to build the owner dashboard magic link; no login system.
  owner_magic_token uuid not null default gen_random_uuid() unique,
  image_url text,
  favicon_url text,
  click_count integer not null default 0,
  moderation_status text not null default 'approved' check (
    moderation_status in ('pending', 'approved', 'rejected')
  ),
  submitter_ip inet,
  submitter_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_bid_at timestamptz
);

create unique index listings_normalized_url_active_idx
  on listings (normalized_url)
  where is_active;

create index listings_board_rank_idx
  on listings (city_id, category_id, current_bid desc, created_at asc)
  where is_active and moderation_status = 'approved';

create index listings_moderation_queue_idx
  on listings (moderation_status)
  where moderation_status = 'pending';

create table payments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id),
  amount integer not null check (amount > 0),
  bid_type text not null check (bid_type in ('claim', 'improve', 'reclaim', 'lock')),
  previous_bid integer not null default 0,
  razorpay_order_id text,
  razorpay_payment_id text unique,
  status text not null default 'created' check (
    status in ('created', 'captured', 'failed', 'refunded')
  ),
  created_at timestamptz not null default now()
);

create index payments_listing_idx on payments (listing_id, created_at desc);

create table clicks (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id),
  "timestamp" timestamptz not null default now(),
  referrer text
);

create index clicks_listing_time_idx on clicks (listing_id, "timestamp" desc);

create table activity_feed (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id),
  event_type text not null check (
    event_type in ('listing_created', 'bid_placed', 'rank_reclaimed', 'top_locked')
  ),
  amount integer,
  "timestamp" timestamptz not null default now()
);

create index activity_feed_time_idx on activity_feed ("timestamp" desc);
