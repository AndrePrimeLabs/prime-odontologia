insert into appointments (id, date, time, patient_name, status, service_type, is_sample)
values
  ('22222222-2222-2222-2222-222222222201', current_date + 1, '09:00', 'Paciente Demo', 'scheduled', 'avaliacao', true),
  ('22222222-2222-2222-2222-222222222202', current_date + 2, '14:30', 'Lead Teste', 'confirmed', 'retorno', true)
on conflict (id) do nothing;
