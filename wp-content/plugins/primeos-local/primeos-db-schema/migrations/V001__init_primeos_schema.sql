-- ═══════════════════════════════════════════════════════════════════════
-- PrimeOsHub · Migration V001 — Initial Schema Bootstrap
-- Tool: Flyway (or run manually via psql)
-- github.com/enterprises/PrimeOsHub / primeos-db-schema
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- Schema
CREATE SCHEMA IF NOT EXISTS primeos;
SET search_path = primeos;

-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- fuzzy search

-- ── Enumerations ─────────────────────────────────────────────────────────
CREATE TYPE resource_type_enum      AS ENUM ('HUMAN','PHYSICAL','INTELLECTUAL','FINANCIAL');
CREATE TYPE cost_type_enum          AS ENUM ('FIXED','VARIABLE','SEMI_VARIABLE','COGS');
CREATE TYPE stream_type_enum        AS ENUM ('SUBSCRIPTION','ONE_TIME','LICENSING','USAGE','ASSET_SALE');
CREATE TYPE partner_type_enum       AS ENUM ('SUPPLIER','ALLIANCE','JV','BUYER','COOPETITOR');
CREATE TYPE relationship_type_enum  AS ENUM ('PERSONAL','SELF_SERVICE','AUTOMATED','COMMUNITY','CO_CREATION');
CREATE TYPE channel_type_enum       AS ENUM ('DIRECT','INDIRECT','DIGITAL','PHYSICAL','PARTNER');
CREATE TYPE channel_phase_enum      AS ENUM ('AWARENESS','EVALUATION','PURCHASE','DELIVERY','AFTERSALES');
CREATE TYPE market_vertical_enum    AS ENUM (
  'RETAIL','SERVICES','HOSPITALITY','HEALTH','EDUCATION',
  'CONSTRUCTION','TECH','LOGISTICS','AGRICULTURE','MANUFACTURING','FINANCIAL'
);
CREATE TYPE plan_tier_enum          AS ENUM ('starter','basic','professional','enterprise','white_label');
CREATE TYPE audit_action_enum       AS ENUM ('INSERT','UPDATE','DELETE','LOGIN','LOGOUT','EXPORT');

-- ── Organizations (root tenant) ───────────────────────────────────────────
CREATE TABLE organizations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) UNIQUE NOT NULL,
  plan_tier       plan_tier_enum DEFAULT 'starter',
  market_vertical market_vertical_enum,
  phone           VARCHAR(30),
  email           VARCHAR(255),
  website         VARCHAR(500),
  country         CHAR(2)     DEFAULT 'BR',
  timezone        VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  settings        JSONB       DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_org_slug    ON organizations(slug);
CREATE INDEX idx_org_phone   ON organizations(phone);
CREATE INDEX idx_org_tier    ON organizations(plan_tier);

-- ── Users ─────────────────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(50) DEFAULT 'member',  -- admin | manager | member | readonly
  avatar_url    VARCHAR(500),
  last_login_at TIMESTAMPTZ,
  is_active     BOOLEAN     DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_user_org   ON users(org_id);
CREATE INDEX idx_user_email ON users(email);

-- ── BMC-01 Key Activities ─────────────────────────────────────────────────
CREATE TABLE bmc_key_activities (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(100),
  owner_id    UUID        REFERENCES users(id),
  status      VARCHAR(50) DEFAULT 'active',
  priority    SMALLINT    DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  kpi_target  NUMERIC(12,2),
  kpi_actual  NUMERIC(12,2),
  frequency   VARCHAR(50),
  notes       TEXT,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bmc_ka_org    ON bmc_key_activities(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bmc_ka_status ON bmc_key_activities(status) WHERE deleted_at IS NULL;

-- ── BMC-02 Key Resources ──────────────────────────────────────────────────
CREATE TABLE bmc_key_resources (
  id            UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID               NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name          VARCHAR(255)       NOT NULL,
  resource_type resource_type_enum NOT NULL,
  unit_value    NUMERIC(15,2),
  currency      CHAR(3)            DEFAULT 'BRL',
  quantity      NUMERIC(12,2)      DEFAULT 1,
  location      VARCHAR(255),
  status        VARCHAR(50)        DEFAULT 'available',
  notes         TEXT,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ        DEFAULT NOW(),
  updated_at    TIMESTAMPTZ        DEFAULT NOW()
);
CREATE INDEX idx_bmc_kr_org  ON bmc_key_resources(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bmc_kr_type ON bmc_key_resources(resource_type);

-- ── BMC-09 Customer Segments (needed before VP for FK) ────────────────────
CREATE TABLE bmc_customer_segments (
  id               UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID                 NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             VARCHAR(255)         NOT NULL,
  market_vertical  market_vertical_enum NOT NULL,
  size_estimate    BIGINT,
  geography        VARCHAR(255),
  demographics     JSONB,
  ltv_avg          NUMERIC(12,2),
  is_active        BOOLEAN              DEFAULT TRUE,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ          DEFAULT NOW(),
  updated_at       TIMESTAMPTZ          DEFAULT NOW()
);
CREATE INDEX idx_bmc_cs_org      ON bmc_customer_segments(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bmc_cs_vertical ON bmc_customer_segments(market_vertical);

-- ── BMC-08 Channels (needed before customer_relationships for FK) ─────────
CREATE TABLE bmc_channels (
  id                   UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID               NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                 VARCHAR(255)       NOT NULL,
  channel_type         channel_type_enum,
  phase                channel_phase_enum,
  cost_per_acquisition NUMERIC(12,2),
  conversion_rate      NUMERIC(5,4),
  is_active            BOOLEAN            DEFAULT TRUE,
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ        DEFAULT NOW(),
  updated_at           TIMESTAMPTZ        DEFAULT NOW()
);
CREATE INDEX idx_bmc_ch_org ON bmc_channels(org_id) WHERE deleted_at IS NULL;

-- ── BMC-03 Value Propositions ─────────────────────────────────────────────
CREATE TABLE bmc_value_propositions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           VARCHAR(255) NOT NULL,
  description    TEXT,
  gain_creators  TEXT[]      DEFAULT '{}',
  pain_relievers TEXT[]      DEFAULT '{}',
  fit_score      NUMERIC(3,1) CHECK (fit_score BETWEEN 0 AND 10),
  is_active      BOOLEAN     DEFAULT TRUE,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vp_segment_map (
  vp_id      UUID NOT NULL REFERENCES bmc_value_propositions(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES bmc_customer_segments(id)  ON DELETE CASCADE,
  PRIMARY KEY (vp_id, segment_id)
);

-- ── BMC-04 Cost Structure ─────────────────────────────────────────────────
CREATE TABLE bmc_cost_structure (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID           NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       VARCHAR(255)   NOT NULL,
  cost_type  cost_type_enum NOT NULL,
  amount     NUMERIC(15,2)  NOT NULL CHECK (amount >= 0),
  currency   CHAR(3)        DEFAULT 'BRL',
  frequency  VARCHAR(50),
  is_fixed   BOOLEAN        DEFAULT TRUE,
  tax_code   VARCHAR(50),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ    DEFAULT NOW(),
  updated_at TIMESTAMPTZ    DEFAULT NOW()
);
CREATE INDEX idx_bmc_cost_org  ON bmc_cost_structure(org_id) WHERE deleted_at IS NULL;

-- ── BMC-05 Revenue Streams ────────────────────────────────────────────────
CREATE TABLE bmc_revenue_streams (
  id          UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID             NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  segment_id  UUID             REFERENCES bmc_customer_segments(id),
  name        VARCHAR(255)     NOT NULL,
  stream_type stream_type_enum NOT NULL,
  amount      NUMERIC(15,2),
  currency    CHAR(3)          DEFAULT 'BRL',
  mrr         NUMERIC(15,2),
  arr         NUMERIC(15,2)    GENERATED ALWAYS AS (mrr * 12) STORED,
  churn_rate  NUMERIC(5,4)     CHECK (churn_rate BETWEEN 0 AND 1),
  start_date  DATE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ      DEFAULT NOW(),
  updated_at  TIMESTAMPTZ      DEFAULT NOW()
);
CREATE INDEX idx_bmc_rev_org ON bmc_revenue_streams(org_id) WHERE deleted_at IS NULL;

-- ── BMC-06 Key Partners ───────────────────────────────────────────────────
CREATE TABLE bmc_key_partners (
  id             UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID              NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           VARCHAR(255)      NOT NULL,
  partner_type   partner_type_enum,
  motivation     TEXT,
  sla_level      VARCHAR(50),
  contract_start DATE,
  contract_end   DATE,
  status         VARCHAR(50)       DEFAULT 'active',
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ       DEFAULT NOW(),
  updated_at     TIMESTAMPTZ       DEFAULT NOW()
);
CREATE INDEX idx_bmc_kp_org ON bmc_key_partners(org_id) WHERE deleted_at IS NULL;

-- ── BMC-07 Customer Relationships ─────────────────────────────────────────
CREATE TABLE bmc_customer_relationships (
  id                UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID                   NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  segment_id        UUID                   REFERENCES bmc_customer_segments(id),
  relationship_type relationship_type_enum,
  channel_id        UUID                   REFERENCES bmc_channels(id),
  nps_score         NUMERIC(4,1)           CHECK (nps_score BETWEEN 0 AND 10),
  csat              NUMERIC(4,1)           CHECK (csat BETWEEN 0 AND 10),
  churn_risk        NUMERIC(4,3)           CHECK (churn_risk BETWEEN 0 AND 1),
  ltv               NUMERIC(15,2),
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ            DEFAULT NOW(),
  updated_at        TIMESTAMPTZ            DEFAULT NOW()
);

-- ── Audit Log (Luzia reads this) ─────────────────────────────────────────
CREATE TABLE audit_log (
  id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID,
  table_name VARCHAR(100)     NOT NULL,
  record_id  UUID,
  action     audit_action_enum NOT NULL,
  old_data   JSONB,
  new_data   JSONB,
  actor_id   UUID,
  actor_type VARCHAR(50),     -- 'user' | 'clara' | 'luzia' | 'system'
  actor_ip   INET,
  metadata   JSONB,
  created_at TIMESTAMPTZ      DEFAULT NOW()
);
CREATE INDEX idx_audit_org   ON audit_log(org_id);
CREATE INDEX idx_audit_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_time  ON audit_log(created_at DESC);
CREATE INDEX idx_audit_actor ON audit_log(actor_id, actor_type);

-- ── Luzia governance reports ──────────────────────────────────────────────
CREATE TABLE luzia_reports (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id       UUID        NOT NULL,
  total_checks INTEGER,
  passed       INTEGER,
  violations   JSONB       DEFAULT '[]',
  health       JSONB,
  ai_analysis  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_luzia_reports_time ON luzia_reports(created_at DESC);

-- ── CRM Leads (captured by Clara) ────────────────────────────────────────
CREATE TABLE crm_leads (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID        REFERENCES organizations(id),
  phone      VARCHAR(30),
  name       VARCHAR(255),
  email      VARCHAR(255),
  company    VARCHAR(255),
  segment    market_vertical_enum,
  interest   TEXT,
  status     VARCHAR(50) DEFAULT 'new',  -- new|contacted|qualified|converted|lost
  source     VARCHAR(100) DEFAULT 'whatsapp-clara',
  score      SMALLINT    DEFAULT 0,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_leads_status ON crm_leads(status);
CREATE INDEX idx_leads_phone  ON crm_leads(phone);

-- ── Trigger: auto update updated_at ──────────────────────────────────────
CREATE OR REPLACE FUNCTION primeos.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organizations','users','bmc_key_activities','bmc_key_resources',
    'bmc_value_propositions','bmc_cost_structure','bmc_revenue_streams',
    'bmc_key_partners','bmc_customer_relationships','bmc_channels',
    'bmc_customer_segments','crm_leads'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at
       BEFORE UPDATE ON primeos.%I
       FOR EACH ROW EXECUTE FUNCTION primeos.set_updated_at()',
      t, t
    );
  END LOOP;
END;
$$;

-- ── Seed: default org for dev ─────────────────────────────────────────────
INSERT INTO primeos.organizations (name, slug, plan_tier, market_vertical, country)
VALUES ('PrimeOS Dev Org', 'primeos-dev', 'enterprise', 'TECH', 'BR')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ── Verification ─────────────────────────────────────────────────────────
DO $$
DECLARE tbl_count INT;
BEGIN
  SELECT COUNT(*) INTO tbl_count
  FROM information_schema.tables
  WHERE table_schema = 'primeos';
  RAISE NOTICE 'Migration V001 complete — % tables created', tbl_count;
END;
$$;
