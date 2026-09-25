# Supabase migrations

`001_create_tables.sql` and `002_rls_policies.sql` are historical migrations.
`003_tenant_isolation.sql` is the active tenant-isolation migration: it creates
the default Prime Odontologia tenant, assigns existing public application rows
to it, and enables membership-based RLS on tenant-scoped tables.

After applying it, add each authenticated user to
`public.tenant_memberships` before expecting client-side queries to return data.
The migration intentionally does not grant every authenticated user access to
the default tenant. Provision a user with:

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
npm run tenant:provision -- --user-id <auth-user-uuid> --role member
```

Run this only from a trusted operator environment. Never place the service-role
key in a `VITE_*` variable or browser-exposed configuration.

**New database work** lives in [`../../database/`](../../database/README.md):

- `database/schema/` — state-based blueprints
- `database/migrations/` — versioned incremental changes (`V1__…`, `V2__…`)
- `database/seeds/` — `dev/` and `prod/` data
- `database/scripts/` — CI/CD runners

Use `npm run db:migrate` from the repo root.
