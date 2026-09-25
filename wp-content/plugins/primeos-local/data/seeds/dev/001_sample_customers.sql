-- Dev-only mock customers (is_sample = true)
insert into customers (id, name, email, phone, status, segment, is_sample)
values
  ('11111111-1111-1111-1111-111111111101', 'Paciente Demo', 'demo@primeos.local', '+5511999990001', 'active', 'premium', true),
  ('11111111-1111-1111-1111-111111111102', 'Lead Teste', 'lead@primeos.local', '+5511999990002', 'lead', 'invisalign', true)
on conflict (id) do nothing;
