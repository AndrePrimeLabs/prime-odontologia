-- ============================================================================
-- PrimeOS — Multi-Tenant Schema + Row Level Security (RLS) Policies
-- Target: Supabase (PostgreSQL + auth.users)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CORE TENANCY TABLES
-- ----------------------------------------------------------------------------

create table if not exists tenants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  segment       text not null default 'dental', -- market vertical
  settings      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Join table: which auth users belong to which tenant, and their role.
create table if not exists tenant_users (
  tenant_id     uuid not null references tenants(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'member'   -- 'owner' | 'admin' | 'member'
                check (role in ('owner','admin','member')),
  created_at    timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 2. BUSINESS MODEL CANVAS (9-BLOCK) TABLES
-- ----------------------------------------------------------------------------

create table if not exists canvases (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  name          text not null default 'Business Model Canvas',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists canvas_block_items (
  id            uuid primary key default gen_random_uuid(),
  canvas_id     uuid not null references canvases(id) on delete cascade,
  tenant_id     uuid not null references tenants(id) on delete cascade,
  block_type    text not null check (block_type in (
                  'key_partners','key_activities','key_resources',
                  'value_propositions','customer_relationships','channels',
                  'customer_segments','cost_structure','revenue_streams'
                )),
  content       text not null,
  metadata      jsonb default '{}'::jsonb,
  position      int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_canvas_block_items_tenant on canvas_block_items(tenant_id);
create index if not exists idx_canvas_block_items_canvas on canvas_block_items(canvas_id);

-- Module marketplace subscription table
create table if not exists module_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  module_key    text not null,           -- e.g. 'finances', 'marketing', 'sales', 'ehr'
  tier          text not null default 'base',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. DOMAIN OPERATIONAL TABLES (Clinical EHR, CRM, Finance, Operations)
-- ----------------------------------------------------------------------------

-- Patients / Clientes
create table if not exists patients (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  name          text not null,
  cpf           text,
  email         text,
  phone         text,
  birth_date    date,
  gender        text,
  address       jsonb default '{}'::jsonb,
  status        text not null default 'active' check (status in ('active','inactive','archived','in_treatment')),
  medical_history jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_patients_tenant on patients(tenant_id);

-- Appointments / Agenda
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  patient_id    uuid references patients(id) on delete set null,
  dentist_id    uuid,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  procedure     text,
  status        text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled','no_show')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_appointments_tenant on appointments(tenant_id);

-- CRM Leads & Funnel
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  name          text not null,
  email         text,
  phone         text,
  source        text default 'website', -- 'website', 'invisalign_landing', 'instagram', 'google', 'referral'
  stage         text not null default 'new' check (stage in ('new','contacted','qualified','scheduled','closed_won','closed_lost')),
  treatment_interest text,
  estimated_value numeric(12,2) default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_leads_tenant on leads(tenant_id);

-- Financial Transactions (Sales, Invoices, Expenses)
create table if not exists financial_transactions (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  patient_id    uuid references patients(id) on delete set null,
  type          text not null check (type in ('revenue','expense')),
  category      text not null,
  amount        numeric(12,2) not null,
  due_date      date not null,
  payment_date  date,
  status        text not null default 'pending' check (status in ('pending','paid','overdue','cancelled')),
  payment_method text,
  description   text,
  metadata      jsonb default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_financial_transactions_tenant on financial_transactions(tenant_id);

-- Operational Tasks & Standard Operating Procedures (SOPs / POPs)
create table if not exists operational_tasks (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  title         text not null,
  description   text,
  assigned_to   uuid,
  priority      text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status        text not null default 'todo' check (status in ('todo','in_progress','completed','blocked')),
  due_date      timestamptz,
  sop_reference text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_operational_tasks_tenant on operational_tasks(tenant_id);

-- ----------------------------------------------------------------------------
-- 4. HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

create or replace function is_tenant_member(check_tenant_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from tenant_users tu
    where tu.tenant_id = check_tenant_id
      and tu.user_id = auth.uid()
  );
$$;

create or replace function is_tenant_admin(check_tenant_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from tenant_users tu
    where tu.tenant_id = check_tenant_id
      and tu.user_id = auth.uid()
      and tu.role in ('owner','admin')
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. ENABLE ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table tenants                 enable row level security;
alter table tenant_users            enable row level security;
alter table canvases                enable row level security;
alter table canvas_block_items      enable row level security;
alter table module_subscriptions    enable row level security;
alter table patients                enable row level security;
alter table appointments            enable row level security;
alter table leads                   enable row level security;
alter table financial_transactions  enable row level security;
alter table operational_tasks       enable row level security;

-- ----------------------------------------------------------------------------
-- 6. POLICIES
-- ----------------------------------------------------------------------------

-- tenants
create policy tenants_select on tenants
  for select using (is_tenant_member(id));
create policy tenants_update on tenants
  for update using (is_tenant_admin(id));

-- tenant_users
create policy tenant_users_select on tenant_users
  for select using (is_tenant_member(tenant_id));
create policy tenant_users_insert on tenant_users
  for insert with check (is_tenant_admin(tenant_id));
create policy tenant_users_delete on tenant_users
  for delete using (is_tenant_admin(tenant_id));

-- canvases
create policy canvases_select on canvases
  for select using (is_tenant_member(tenant_id));
create policy canvases_insert on canvases
  for insert with check (is_tenant_member(tenant_id));
create policy canvases_update on canvases
  for update using (is_tenant_member(tenant_id));
create policy canvases_delete on canvases
  for delete using (is_tenant_admin(tenant_id));

-- canvas_block_items
create policy canvas_block_items_select on canvas_block_items
  for select using (is_tenant_member(tenant_id));
create policy canvas_block_items_insert on canvas_block_items
  for insert with check (is_tenant_member(tenant_id));
create policy canvas_block_items_update on canvas_block_items
  for update using (is_tenant_member(tenant_id));
create policy canvas_block_items_delete on canvas_block_items
  for delete using (is_tenant_admin(tenant_id));

-- module_subscriptions
create policy module_subscriptions_select on module_subscriptions
  for select using (is_tenant_member(tenant_id));
create policy module_subscriptions_write on module_subscriptions
  for all using (is_tenant_admin(tenant_id))
  with check (is_tenant_admin(tenant_id));

-- patients
create policy patients_select on patients
  for select using (is_tenant_member(tenant_id));
create policy patients_insert on patients
  for insert with check (is_tenant_member(tenant_id));
create policy patients_update on patients
  for update using (is_tenant_member(tenant_id));
create policy patients_delete on patients
  for delete using (is_tenant_admin(tenant_id));

-- appointments
create policy appointments_select on appointments
  for select using (is_tenant_member(tenant_id));
create policy appointments_insert on appointments
  for insert with check (is_tenant_member(tenant_id));
create policy appointments_update on appointments
  for update using (is_tenant_member(tenant_id));
create policy appointments_delete on appointments
  for delete using (is_tenant_admin(tenant_id));

-- leads (allow public insert for landing page lead capture)
create policy leads_select on leads
  for select using (is_tenant_member(tenant_id));
create policy leads_insert_tenant on leads
  for insert with check (is_tenant_member(tenant_id) or tenant_id is not null);
create policy leads_update on leads
  for update using (is_tenant_member(tenant_id));
create policy leads_delete on leads
  for delete using (is_tenant_admin(tenant_id));

-- financial_transactions
create policy financial_transactions_select on financial_transactions
  for select using (is_tenant_member(tenant_id));
create policy financial_transactions_insert on financial_transactions
  for insert with check (is_tenant_member(tenant_id));
create policy financial_transactions_update on financial_transactions
  for update using (is_tenant_member(tenant_id));
create policy financial_transactions_delete on financial_transactions
  for delete using (is_tenant_admin(tenant_id));

-- operational_tasks
create policy operational_tasks_select on operational_tasks
  for select using (is_tenant_member(tenant_id));
create policy operational_tasks_insert on operational_tasks
  for insert with check (is_tenant_member(tenant_id));
create policy operational_tasks_update on operational_tasks
  for update using (is_tenant_member(tenant_id));
create policy operational_tasks_delete on operational_tasks
  for delete using (is_tenant_admin(tenant_id));
