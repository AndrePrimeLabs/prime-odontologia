-- Production reference data (no mock patients)
-- Ensure default growth stages exist for PrimeOS dashboard
insert into prime_growth_stages (id, nome, ordem, descricao, is_sample)
values
  ('33333333-3333-3333-3333-333333333301', 'Atração', 1, 'Topo do funil', false),
  ('33333333-3333-3333-3333-333333333302', 'Conversão', 2, 'Meio do funil', false),
  ('33333333-3333-3333-3333-333333333303', 'Retenção', 3, 'Fundo do funil', false)
on conflict (id) do nothing;
