-- PrimeOS schema: marketing & growth
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'active', budget numeric,
  start_date date, end_date date, target_audience text, goals jsonb default '[]',
  metrics jsonb default '{}', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists market_strategies (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, objectives jsonb default '[]',
  status text default 'active', start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists marketing_channels (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'active', cost_per_lead numeric,
  conversion_rate numeric, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists marketing_metrics (
  id uuid primary key default uuid_generate_v4(),
  data date, channel text, metric_type text, value numeric,
  campaign_id uuid, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists channels (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists ab_tests (
  id uuid primary key default uuid_generate_v4(),
  name text, status text default 'draft', variant_a jsonb, variant_b jsonb,
  results jsonb, start_date date, end_date date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists email_sequences (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, steps jsonb default '[]', status text default 'active',
  notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists contents (
  id uuid primary key default uuid_generate_v4(),
  title text, body text, type text, status text default 'draft',
  channel text, published_at timestamptz, tags jsonb default '[]', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists automation_workflows (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, actions jsonb default '[]', status text default 'active',
  notes text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create index if not exists idx_marketing_metrics_data on marketing_metrics (data);
