create or replace view active_customers as
select
  id,
  name,
  email,
  phone,
  segment,
  lifetime_value,
  last_contact_date,
  created_date
from customers
where status = 'active';
