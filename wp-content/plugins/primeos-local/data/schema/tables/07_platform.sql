-- PrimeOS schema: SEO, gamification, platform
create table if not exists project_seos (
  id uuid primary key default uuid_generate_v4(),
  nome text, url text, status_operacional text, fase_atual text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists tarefa_seos (
  id uuid primary key default uuid_generate_v4(),
  projeto_id uuid, titulo text, status text, prioridade text, data_vencimento date,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists palavra_chaves (
  id uuid primary key default uuid_generate_v4(),
  palavra text, volume int, dificuldade numeric, status text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists conteudo_seo (
  id uuid primary key default uuid_generate_v4(),
  titulo text, url text, status text, palavra_chave text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists back_links (
  id uuid primary key default uuid_generate_v4(),
  url_origem text, url_destino text, status text, autoridade numeric,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists relatorio_seos (
  id uuid primary key default uuid_generate_v4(),
  periodo text, metricas jsonb, resumo text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_growth_stages (
  id uuid primary key default uuid_generate_v4(),
  nome text, ordem int, descricao text, metas jsonb,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_funnel_leads (
  id uuid primary key default uuid_generate_v4(),
  nome text, status text, ticket_estimado numeric, origem text, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists prime_delegation_tasks (
  id uuid primary key default uuid_generate_v4(),
  titulo text, responsavel text, status text, prazo date, notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists report_schedules (
  id uuid primary key default uuid_generate_v4(),
  name text, report_type text, frequency text, recipients jsonb,
  is_active boolean default true, last_run timestamptz,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists custom_dashboards (
  id uuid primary key default uuid_generate_v4(),
  name text, layout jsonb, filters jsonb, owner_id uuid,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists key_partners (
  id uuid primary key default uuid_generate_v4(),
  name text, type text, contact text, status text default 'active', notes text,
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists value_propositions (
  id uuid primary key default uuid_generate_v4(),
  title text, description text, segment text, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists business_strategies (
  id uuid primary key default uuid_generate_v4(),
  name text, description text, pillars jsonb, status text default 'active',
  created_by_id uuid, is_sample boolean default false,
  created_date timestamptz default now(), updated_date timestamptz default now()
);

create table if not exists user_engagements (
  id uuid primary key default uuid_generate_v4(),
  user_email text, event_type text, feature_name text, session_id text,
  duration_seconds int, conversion_step text, metadata jsonb,
  created_date timestamptz default now()
);

create table if not exists user_points (
  id uuid primary key default uuid_generate_v4(),
  user_email text, points int default 0, reason text,
  created_date timestamptz default now()
);

create table if not exists user_badges (
  id uuid primary key default uuid_generate_v4(),
  user_email text, badge_code text, badge_name text, earned_at timestamptz default now()
);

create table if not exists app_analytics (
  id uuid primary key default uuid_generate_v4(),
  event text, payload jsonb, created_date timestamptz default now()
);

create table if not exists app_reviews (
  id uuid primary key default uuid_generate_v4(),
  rating int, comment text, platform text, created_date timestamptz default now()
);

create table if not exists app_versions (
  id uuid primary key default uuid_generate_v4(),
  version text, platform text, release_notes text, released_at timestamptz
);

create table if not exists mobile_apps (
  id uuid primary key default uuid_generate_v4(),
  name text, bundle_id text, platform text, status text default 'active'
);
