-- Lock down direct table access; the Next.js server uses the service role key
-- for all writes and for reads that need owner_contact. Anonymous (browser)
-- access goes through the public views below, which hide owner_contact and
-- listings still sitting in the moderation queue.
alter table cities enable row level security;
alter table categories enable row level security;
alter table listings enable row level security;
alter table payments enable row level security;
alter table clicks enable row level security;
alter table activity_feed enable row level security;

create policy "cities are publicly readable"
  on cities for select
  to anon, authenticated
  using (true);

create policy "categories are publicly readable"
  on categories for select
  to anon, authenticated
  using (true);

-- No anon/authenticated policies on listings, payments, or clicks: reached
-- only through the service role or the sanitized views below.

create view listings_public as
  select
    id, url, title, description, category_id, city_id, current_bid,
    is_claimed, is_locked, locked_until, image_url, favicon_url,
    click_count, created_at, last_bid_at
  from listings
  where is_active and moderation_status = 'approved';

grant select on listings_public to anon, authenticated;

create view activity_feed_public as
  select af.id, af.listing_id, af.event_type, af.amount, af."timestamp"
  from activity_feed af
  join listings l on l.id = af.listing_id
  where l.is_active and l.moderation_status = 'approved';

grant select on activity_feed_public to anon, authenticated;
