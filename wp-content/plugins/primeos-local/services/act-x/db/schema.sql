CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS key_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  owner_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  priority INT NOT NULL DEFAULT 3,
  kpi_target NUMERIC(10,2),
  kpi_actual NUMERIC(10,2),
  frequency TEXT NOT NULL DEFAULT 'daily',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_key_activities_tenant ON key_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sops_tenant ON sops(tenant_id);

ALTER TABLE key_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_key_activities ON key_activities
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY tenant_isolation_sops ON sops
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
