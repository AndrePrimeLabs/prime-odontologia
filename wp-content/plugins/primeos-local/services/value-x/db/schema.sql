CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS value_propositions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  core_promise TEXT NOT NULL,
  segment_id UUID,
  pillars JSONB NOT NULL DEFAULT '[]',
  pain_relievers JSONB NOT NULL DEFAULT '[]',
  gain_creators JSONB NOT NULL DEFAULT '[]',
  fit_score NUMERIC(5,2) DEFAULT 80.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_value_propositions_tenant ON value_propositions(tenant_id);

ALTER TABLE value_propositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_value_propositions ON value_propositions
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
