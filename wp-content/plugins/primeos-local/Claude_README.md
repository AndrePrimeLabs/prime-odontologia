# PrimeOSApp — Local Monorepo Scaffold

This is a working scaffold for the first isolated block: **CRM-X**, wired up
per the architecture, multi-tenant isolation, and Pandora deployment docs in
`/docs`. It's runnable today, either on your dev machine or directly on the
Palit Pandora over Remote-SSH.

## What's actually implemented right now
- `services/crm-x` — a real Express + PostgreSQL service with:
  - `customers`, `interactions`, `tickets`, `loyalty_points`, `follow_ups` tables
  - Row-Level Security enforcing tenant isolation at the database layer
  - A tenant-context middleware + `tenantQuery()` helper so every query is
    automatically scoped — see `docs/PrimeOSApp_Multi_Tenant_Data_Isolation.md`
  - Events published to NATS (`customer.created`, `ticket.created`, etc.)
    for other blocks to consume later
- `docker-compose.pandora.yml` — brings up Traefik, Postgres, NATS, and CRM-X
- `data-export/` — where your Base44 CSV exports go
- The other 8 service folders (`seg-x`, `rev-x`, etc.) are stubbed as empty
  directories — copy the CRM-X structure as a template when you get to them

## Quick start (local machine or Pandora via Remote-SSH)

```bash
# 1. Bring up infrastructure + CRM-X
docker compose -f docker-compose.pandora.yml up -d

# 2. Apply the schema (from inside the container, or point DATABASE_URL
#    at localhost:5432 if running this on your host machine)
cd services/crm-x
npm install
DATABASE_URL=postgres://postgres:pass@localhost:5432/crmx npm run migrate

# 3. Seed real customers from your Base44 export
#    (put customers.csv in ../../data-export/ first)
TENANT_ID=00000000-0000-0000-0000-000000000001 \
DATABASE_URL=postgres://postgres:pass@localhost:5432/crmx \
npm run seed

# 4. Test it
curl -X POST http://localhost/api/customers \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{"name": "Maria Silva", "email": "maria@example.com"}'

curl http://localhost/api/customers \
  -H "X-Tenant-Id: 00000000-0000-0000-0000-000000000001"
```

If everything above returns JSON, you have a real, isolated CRM-X service
running locally — the first genuine building block of the migration off
Base44.

## Next step: point your frontend at it
In your exported Base44 frontend, find where the SDK calls the customers
entity and swap the base URL:
```diff
- const res = await base44.entities.Customer.list();
+ const res = await fetch('http://<pandora-ip>/api/customers', {
+   headers: { 'X-Tenant-Id': currentTenantId }
+ });
```
Get **one screen** (e.g. the customer list) fully working against this
service before moving to the next block. That's the real milestone —
everything after CRM-X follows the same pattern.

## Then: repeat for REV-X
Per the phased build order in `docs/PrimeOSApp_Technical_Architecture.md`,
REV-X is next (Revenue Core). Copy `services/crm-x` as
`services/rev-x`, swap the schema for `revenue_streams` / `transactions` /
`subscriptions` (see the ER diagram in the architecture doc), and add it to
`docker-compose.pandora.yml` the same way CRM-X was added.
