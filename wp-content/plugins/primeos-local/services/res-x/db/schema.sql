CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS key_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT 'PHYSICAL',
  unit_value NUMERIC(12,2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_key_resources_tenant ON key_resources(tenant_id);

ALTER TABLE key_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_key_resources ON key_resources
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
