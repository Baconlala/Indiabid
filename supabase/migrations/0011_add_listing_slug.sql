-- Pretty, shareable listing URLs (e.g. /listing/charitism instead of a UUID).
alter table listings add column slug text;

create unique index listings_slug_active_idx
  on listings (slug)
  where is_active;

-- Postgres allows appending columns to a view via create-or-replace as long as
-- the existing column list and order are untouched.
create or replace view listings_public as
  select
    id, url, title, description, category_id, city_id, current_bid,
    is_claimed, is_locked, locked_until, image_url, favicon_url,
    click_count, created_at, last_bid_at, slug
  from listings
  where is_active and moderation_status = 'approved';
