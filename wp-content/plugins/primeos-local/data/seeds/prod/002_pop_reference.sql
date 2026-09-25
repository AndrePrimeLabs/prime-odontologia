-- Essential POP codes (reference only — extend from data/POP.csv import scripts)
insert into pops (id, codigo, titulo, status, is_sample)
values
  ('44444444-4444-4444-4444-444444444401', 'POP 01', 'Limpeza da Clínica', 'ativo', false),
  ('44444444-4444-4444-4444-444444444402', 'POP 03', 'Atendimento ao Paciente', 'ativo', false)
on conflict (id) do nothing;
