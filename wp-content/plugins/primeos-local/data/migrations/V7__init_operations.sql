-- V7: operations indexes
insert into schema_migrations (version, description)
values ('V7', 'init_operations')
on conflict (version) do nothing;

create index if not exists idx_tasks_status on tasks (status);
create index if not exists idx_support_tickets_status on support_tickets (status);
