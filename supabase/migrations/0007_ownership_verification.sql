-- Free-claim ownership was previously "verified" by string-matching an
-- email's domain against the listing's URL — but nothing proved the claimer
-- actually controlled that inbox, so anyone could type a made-up address at
-- the right domain and instantly get the dashboard. These columns support a
-- real click-to-confirm email flow: a token is emailed to the claimed
-- address, and ownership (or dashboard access, for the recovery flow) is
-- only granted once that link is clicked.

alter table listings
  add column pending_owner_email text,
  add column pending_owner_token uuid,
  add column pending_owner_token_expires_at timestamptz,
  add column pending_owner_requested_at timestamptz;

create unique index listings_pending_owner_token_idx
  on listings (pending_owner_token)
  where pending_owner_token is not null;
