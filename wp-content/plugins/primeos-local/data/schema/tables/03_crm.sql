-- PrimeOS schema: CRM
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, company text, profession text,
  city text, state text, birth_date date, source text, segment text, value_tier text,
  status text default 'active', tags jsonb default '[]', interests jsonb default '[]',
  custom_fields jsonb, lifetime_value numeric default 0, last_contact_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists customer_segments (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, criteria jsonb,
  customer_count int default 0, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  name text, email text, phone text, status text default 'novo',
  temperatura text, interesse text, segmento text, fonte_original text, canal_conversao text,
  campanha_id uuid, origem_canal_id uuid, lead_score numeric default 0,
  ai_score numeric, ai_classification text, ai_analysis jsonb, ai_conversion_probability numeric,
  valor_estimado numeric, lifetime_value numeric default 0, total_interacoes int default 0,
  taxa_resposta numeric, tempo_medio_resposta numeric, ultima_interacao timestamptz,
  data_entrada timestamptz default now(), tags jsonb default '[]', notas text,
  workflow_ativo boolean default false, workflow_etapa text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists lead_interactions (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references leads (id) on delete cascade,
  type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers (id) on delete cascade,
  type text, subject text, description text,
  outcome text, next_action text, next_action_date date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists client_journeys (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers (id) on delete set null,
  stage text, status text, notes text,
  started_at timestamptz, completed_at timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_appointments (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid, appointment_id uuid, crm_id text,
  status text, notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_sync_settings (
  id uuid primary key default uuid_generate_v4(),
  entity_type text, sync_enabled boolean default false,
  sync_interval int, last_sync timestamptz, settings jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists crm_workflows (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, actions jsonb default '[]',
  status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create index if not exists idx_leads_status on leads (status);
create index if not exists idx_customers_status on customers (status);
