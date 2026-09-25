-- PrimeOS tenant isolation.
-- Existing application rows are assigned to the default Prime Odontologia tenant.
-- No live data is changed until this migration is applied with Supabase CLI.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

INSERT INTO public.tenants (id, name, slug)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Prime Odontologia',
  'prime-odontologia'
)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_tenant_member(candidate_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_memberships
    WHERE tenant_id = candidate_tenant_id
      AND user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claim_value TEXT;
  membership_tenant UUID;
BEGIN
  claim_value := (SELECT auth.jwt() -> 'app_metadata' ->> 'tenant_id');
  IF claim_value ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN claim_value::UUID;
  END IF;

  SELECT tenant_id
  INTO membership_tenant
  FROM public.tenant_memberships
  WHERE user_id = (SELECT auth.uid())
  ORDER BY created_at
  LIMIT 1;

  RETURN membership_tenant;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_row_tenant_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.current_tenant_id();
  END IF;

  IF NEW.tenant_id IS NULL THEN
    RAISE EXCEPTION 'A tenant context is required';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name TEXT;
  policy_name TEXT;
BEGIN
  FOR table_name IN
    SELECT c.relname
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname NOT IN ('users', 'tenants', 'tenant_memberships')
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id UUID',
      table_name
    );

    EXECUTE format(
      'UPDATE public.%I SET tenant_id = %L::UUID WHERE tenant_id IS NULL',
      table_name,
      '00000000-0000-0000-0000-000000000001'
    );

    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN tenant_id SET NOT NULL',
      table_name
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON public.%I (tenant_id)',
      table_name || '_tenant_id_idx',
      table_name
    );

    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_row_tenant_id ON public.%I',
      table_name
    );
    EXECUTE format(
      'CREATE TRIGGER set_row_tenant_id
       BEFORE INSERT ON public.%I
       FOR EACH ROW EXECUTE FUNCTION public.set_row_tenant_id()',
      table_name
    );

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', table_name);
    FOR policy_name IN
      SELECT pol.policyname
      FROM pg_policies AS pol
      WHERE pol.schemaname = 'public'
        AND pol.tablename = table_name
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY tenant_isolation ON public.%I
       FOR ALL TO authenticated
       USING (public.is_tenant_member(tenant_id))
       WITH CHECK (public.is_tenant_member(tenant_id))',
      table_name
    );
  END LOOP;
END;
$$;

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_membership_select ON public.tenant_memberships;
CREATE POLICY tenant_membership_select ON public.tenant_memberships
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) OR public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS tenant_select ON public.tenants;
CREATE POLICY tenant_select ON public.tenants
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(id));
