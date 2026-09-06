-- Ownership-verification emails go to an address the requester typed, not
-- one they've proven they control yet — without a rate limit, the claim-free
-- and resend-link endpoints could be hammered to blast confirmation-shaped
-- emails at many addresses on a domain (spam/phishing-adjacent abuse), same
-- risk class the existing listings.submitter_ip rate limit guards against.

create table claim_email_requests (
  id uuid primary key default gen_random_uuid(),
  ip inet not null,
  created_at timestamptz not null default now()
);

create index claim_email_requests_ip_time_idx on claim_email_requests (ip, created_at desc);
