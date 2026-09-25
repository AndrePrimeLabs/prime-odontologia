-- V6: marketing indexes
insert into schema_migrations (version, description)
values ('V6', 'init_marketing')
on conflict (version) do nothing;

create index if not exists idx_campaigns_status on campaigns (status);
