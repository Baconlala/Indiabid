# Database

Migrations in `migrations/` are plain SQL, applied in filename order.

## Apply via Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

## Or paste manually

Run each file in order in the Supabase Dashboard's SQL Editor:
`0001_init_schema.sql` → `0002_rls_policies.sql` → `0003_seed_categories_cities.sql`.

## Notes

- `listings`, `payments`, and `clicks` have RLS enabled with no anon policies —
  all writes and any read that needs `owner_contact` go through the Next.js
  server using `SUPABASE_SERVICE_ROLE_KEY`.
- The browser reads leaderboard data through the `listings_public` and
  `activity_feed_public` views, which strip `owner_contact` and exclude
  listings still in the moderation queue (`moderation_status = 'pending'`).
- `listings.owner_magic_token` is the unguessable id used to build each
  owner's `/dashboard/[token]` link — there's no login system.
