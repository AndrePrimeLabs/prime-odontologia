create or replace view upcoming_appointments as
select
  a.id,
  a.date,
  a.time,
  a.patient_name,
  a.status,
  a.service_type,
  d.name as dentist_name
from appointments a
left join dentists d on d.id = a.dentist_id
where a.date >= current_date
  and a.status in ('scheduled', 'confirmed')
order by a.date, a.time;
