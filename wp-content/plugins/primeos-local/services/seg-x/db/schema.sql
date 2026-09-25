CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  market_vertical TEXT NOT NULL DEFAULT 'HEALTH',
  target_age_min INT DEFAULT 0,
  target_age_max INT DEFAULT 120,
  estimated_market_size INT DEFAULT 0,
  avg_ltv NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  criteria JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS segment_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  persona_name TEXT NOT NULL,
  occupation TEXT,
  primary_pain_points JSONB DEFAULT '[]',
  desired_gains JSONB DEFAULT '[]',
  buying_criteria JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_segments_tenant ON customer_segments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_segment_personas_tenant ON segment_personas(tenant_id);

ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_customer_segments ON customer_segments
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
CREATE POLICY tenant_isolation_segment_personas ON segment_personas
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
