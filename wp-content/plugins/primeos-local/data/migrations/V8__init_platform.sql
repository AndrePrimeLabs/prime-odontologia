-- V8: platform / SEO indexes
insert into schema_migrations (version, description)
values ('V8', 'init_platform')
on conflict (version) do nothing;

create index if not exists idx_user_engagements_email on user_engagements (user_email);
