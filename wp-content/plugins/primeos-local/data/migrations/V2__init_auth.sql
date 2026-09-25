-- V2: auth profiles + migration tracking
create table if not exists schema_migrations (
  version text primary key,
  description text,
  applied_at timestamptz not null default now()
);

insert into schema_migrations (version, description)
values ('V2', 'init_auth')
on conflict (version) do nothing;

-- profiles blueprint (see schema/tables/01_auth_profiles.sql for full state)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user',
  avatar_url text,
  status text not null default 'active',
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index if not exists idx_profiles_email on profiles (email);
