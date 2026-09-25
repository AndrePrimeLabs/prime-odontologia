-- Example stored procedure: refresh denormalized customer metrics
create or replace procedure refresh_customer_metrics()
language plpgsql
as $$
begin
  update customers c
  set
    lifetime_value = coalesce(s.total, 0),
    last_contact_date = s.last_sale
  from (
    select
      customer_id,
      sum(total_amount) as total,
      max(sale_date) as last_sale
    from sales
    where customer_id is not null
    group by customer_id
  ) s
  where c.id = s.customer_id;
end;
$$;
