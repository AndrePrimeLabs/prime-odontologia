-- PrimeOS schema: auth-linked user profiles
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
create index if not exists idx_profiles_role on profiles (role);
