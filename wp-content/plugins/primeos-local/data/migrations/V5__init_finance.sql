-- V5: finance indexes
insert into schema_migrations (version, description)
values ('V5', 'init_finance')
on conflict (version) do nothing;

create index if not exists idx_financial_transactions_due on financial_transactions (due_date);
