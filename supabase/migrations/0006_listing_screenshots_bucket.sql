-- Public-read bucket for listing screenshots uploaded at submission time.
-- Uploads only ever happen server-side (service role, via /api/listings),
-- which already bypasses storage RLS the same way it bypasses table RLS —
-- so no anon write policy is needed here, only public read.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-screenshots',
  'listing-screenshots',
  true,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
