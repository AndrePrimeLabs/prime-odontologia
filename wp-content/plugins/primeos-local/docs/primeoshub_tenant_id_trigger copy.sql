-- ============================================================================
-- PrimeOsHub — Auto-fill tenant_id on canvas_block_items
-- Run AFTER primeoshub_rls_schema.sql
-- ============================================================================

create or replace function set_canvas_block_item_tenant_id()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Always derive tenant_id from the parent canvas, ignoring whatever the
  -- client sent — this closes the gap where Lovable-generated insert code
  -- forgets (or gets tricked into faking) the tenant_id.
  select tenant_id into new.tenant_id
  from canvases
  where id = new.canvas_id;

  if new.tenant_id is null then
    raise exception 'canvas_id % does not reference a valid canvas', new.canvas_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_canvas_block_item_tenant_id on canvas_block_items;

create trigger trg_set_canvas_block_item_tenant_id
  before insert or update of canvas_id on canvas_block_items
  for each row
  execute function set_canvas_block_item_tenant_id();

-- ----------------------------------------------------------------------------
-- NOTE: because this trigger derives tenant_id server-side and ignores the
-- client-supplied value, the canvas_block_items_insert / _update RLS
-- policies still gate on tenant_id — but that check now happens against the
-- trigger-set (trustworthy) value rather than anything the client sent. This
-- means a compromised or buggy frontend can no longer insert a row with a
-- mismatched tenant_id, even accidentally.
-- ----------------------------------------------------------------------------
