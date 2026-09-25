-- Enable uuid generation (Supabase usually has this already)
create extension if not exists pgcrypto;

-- 1) Track migration runs
create table if not exists migration_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,                 -- e.g. "primeos"
  note text,
  stats jsonb
);

-- 2) STAGING: raw primeos payloads (one row per record from primeos)
create table if not exists primeos_raw (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_table text not null,           -- e.g. "contacts", "leads", "tasks"
  source_id text,                       -- id in primeos (string)
  payload jsonb not null,               -- full raw record
  migrated boolean not null default false,
  migrated_at timestamptz,
  error text
);

create index if not exists idx_primeos_raw_table on primeos_raw (source_table);
create index if not exists idx_primeos_raw_source_id on primeos_raw (source_id);

-- 3) CANONICAL entities (PrimeOS)

-- Patients/Contacts (rename as needed: contacts, patients, people)
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  external_source text,                 -- "primeos"
  external_id text,                     -- primeos id
  full_name text not null,
  phone text,
  email text,
  tags text[] default '{}'::text[],

  raw_source jsonb                      -- optional: snapshot of original mapping input
);

create unique index if not exists uq_contacts_external
  on contacts (external_source, external_id);

-- CRM deals / leads
create table if not exists crm_deals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  external_source text,
  external_id text,

  title text not null,
  stage text,
  value numeric,
  contact_id uuid references contacts(id),

  raw_source jsonb
);

create unique index if not exists uq_crm_deals_external
  on crm_deals (external_source, external_id);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  external_source text,
  external_id text,

  title text not null,
  status text,
  priority text,
  owner text,                           -- or owner_user_id uuid if you model users
  due_date date,

  related_contact_id uuid references contacts(id),
  related_deal_id uuid references crm_deals(id),

  raw_source jsonb
);

create unique index if not exists uq_tasks_external
  on tasks (external_source, external_id);

-- SOPs / Knowledge
create table if not exists sops (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  external_source text,
  external_id text,

  title text not null,
  category text,
  version text,

  raw_source jsonb
);

create unique index if not exists uq_sops_external
  on sops (external_source, external_id);

-- 4) Audit log (optional but recommended)
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,                  -- "system", "user:<id>", "agent"
  action text not null,                 -- "migration.import", "migration.map", "tasks.update"
  entity_type text,
  entity_id text,
  payload jsonb
);

-- 5) Sync state (if you also sync with Notion later)
create table if not exists notion_sync_state (
  id text primary key,                  -- e.g. "default"
  last_sync_at timestamptz,
  last_cursor text
);