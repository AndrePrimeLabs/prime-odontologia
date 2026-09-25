CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS key_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  dependency_level TEXT DEFAULT 'media',
  strategic_importance TEXT DEFAULT 'alta',
  contact_info TEXT,
  contract_details TEXT,
  on_time_delivery_rate NUMERIC(5,2) DEFAULT 95.0,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_key_partners_tenant ON key_partners(tenant_id);

ALTER TABLE key_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_key_partners ON key_partners
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
