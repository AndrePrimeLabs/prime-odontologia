-- V4: CRM indexes and migration marker
insert into schema_migrations (version, description)
values ('V4', 'init_crm')
on conflict (version) do nothing;

create index if not exists idx_leads_email on leads (email);
create index if not exists idx_interactions_customer on interactions (customer_id);
