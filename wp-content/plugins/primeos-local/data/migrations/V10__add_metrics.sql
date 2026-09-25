-- V10: analytics metrics table (incremental example)
insert into schema_migrations (version, description)
values ('V10', 'add_metrics')
on conflict (version) do nothing;

create table if not exists daily_metrics (
  id uuid primary key default uuid_generate_v4(),
  metric_date date not null,
  metric_key text not null,
  metric_value numeric not null default 0,
  dimensions jsonb default '{}',
  created_date timestamptz not null default now(),
  unique (metric_date, metric_key)
);

create index if not exists idx_daily_metrics_date on daily_metrics (metric_date);
