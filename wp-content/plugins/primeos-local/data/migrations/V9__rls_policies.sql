-- V9: row-level security (adjust roles to match your auth model)
insert into schema_migrations (version, description)
values ('V9', 'rls_policies')
on conflict (version) do nothing;

alter table profiles enable row level security;

drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles
  for update using (auth.uid() = id);

drop policy if exists profiles_admin_all on profiles;
create policy profiles_admin_all on profiles
  for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
