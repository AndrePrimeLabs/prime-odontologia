-- V3: clinical domain (incremental deploy — run db:schema for full blueprint)
insert into schema_migrations (version, description)
values ('V3', 'init_clinical')
on conflict (version) do nothing;

-- Add columns safely on existing deployments
alter table appointments add column if not exists ehr_synced boolean default false;
alter table resources add column if not exists is_active boolean default true;
