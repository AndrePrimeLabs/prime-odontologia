-- PrimeOS schema: operations, tasks, support
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  titulo text, descricao text, status text default 'pendente',
  prioridade text, responsavel text, data_vencimento date,
  pop_codigo text, checklist jsonb default '[]', recorrente boolean default false,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists pops (
  id uuid primary key default uuid_generate_v4(),
  codigo text, titulo text, objetivo text, responsavel text,
  frequencia text, categoria text, status text default 'ativo',
  checklist jsonb default '[]', documento_url text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sops (
  id uuid primary key default uuid_generate_v4(),
  title text, area text, version text, content text,
  last_update timestamptz, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, status text default 'pending',
  priority text, assignee text, due_date date, category text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  name text, sku text, category text, quantity numeric default 0,
  min_stock numeric, unit text, supplier text, status text default 'active',
  is_active boolean default true, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists support_tickets (
  id uuid primary key default uuid_generate_v4(),
  subject text, description text, status text default 'open',
  priority text, category text, customer_email text, assigned_to text,
  resolution text, created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_ups (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid, patient_name text, type text, status text default 'pending',
  scheduled_date date, notes text, completed_at timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_up_logs (
  id uuid primary key default uuid_generate_v4(),
  rule_id uuid, entity_id uuid, status text, result jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists follow_up_rules (
  id uuid primary key default uuid_generate_v4(),
  name text, trigger text, conditions jsonb, actions jsonb,
  is_active boolean default true, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists reminder_schedules (
  id uuid primary key default uuid_generate_v4(),
  name text, entity_type text, timing jsonb, channel text,
  is_active boolean default true, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists knowledge_bases (
  id uuid primary key default uuid_generate_v4(),
  title text, content text, category text, tags jsonb default '[]',
  status text default 'published', created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists sales_scripts (
  id uuid primary key default uuid_generate_v4(),
  name text, segment text, content text, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);
