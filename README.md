# IndiaBid

A pay-to-rank public leaderboard for India. Adding a listing is free — rank is
decided entirely by total amount paid, on a national board and separate city
boards. 10% of every rupee bid is pledged to underprivileged kids' education.

## Stack

- [Next.js](https://nextjs.org) (App Router), deployed on Vercel
- [Supabase](https://supabase.com) (Postgres) for the database
- [Razorpay](https://razorpay.com) for payments (UPI, cards, netbanking)

## Local development

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in the values described below.

## Environment variables

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (publishable/anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (secret/service_role key — server-only, never expose to the browser) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys (server-only) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Settings → Webhooks, once configured (see below) |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://your-app.vercel.app`) |

## Database

See [supabase/README.md](supabase/README.md) — migrations live in
`supabase/migrations/` and are applied in order via the Supabase SQL Editor
(or `supabase/apply_all.sql` for a single-paste version).

## Deploying

1. Push this repo to GitHub.
2. In Vercel, **Import Project** from that repo.
3. Add all the environment variables above in Vercel's Project Settings →
   Environment Variables, using your production Supabase project and
   Razorpay **live** keys when you're ready to go live (keep using test keys
   until then).
4. Once deployed, set `NEXT_PUBLIC_SITE_URL` to the real deployed URL and
   redeploy.
5. In the Razorpay Dashboard, add a webhook pointing at
   `https://<your-domain>/api/razorpay/webhook`, subscribed to the
   `payment.captured` event, and put its signing secret into
   `RAZORPAY_WEBHOOK_SECRET`. This is the reliable path that updates the
   leaderboard even if a buyer closes their browser right after paying — it
   can't be tested from localhost since Razorpay needs a public URL to call.
