-- Migration: 0000_proppilot_m1
-- Purpose: PropPilot schema, local domain tables, feature flags, audit, object metadata.
-- Expand: additive CREATE SCHEMA / CREATE EXTENSION / CREATE TABLE / seed INSERTs only.
-- Contract / rollback (dev only):
--   DROP SCHEMA IF EXISTS proppilot CASCADE;
--   (Do not DROP EXTENSION vector in shared DBs.)
-- Production: never drop; use expand-contract (new columns/tables, soft-delete).
-- pgvector is enabled for M2+ embeddings; unused in M1 runtime code.

CREATE SCHEMA IF NOT EXISTS proppilot;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS proppilot.broker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    external_ref VARCHAR(128),
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(320),
    phone VARCHAR(64),
    notification_endpoint VARCHAR(512),
    working_hours_json JSONB,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_broker_tenant ON proppilot.broker (tenant_id);
CREATE INDEX IF NOT EXISTS idx_broker_tenant_active ON proppilot.broker (tenant_id, active);

CREATE TABLE IF NOT EXISTS proppilot.lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    external_ref VARCHAR(128),
    full_name VARCHAR(255),
    email VARCHAR(320),
    phone VARCHAR(64),
    source VARCHAR(64) NOT NULL DEFAULT 'unknown',
    state VARCHAR(64) NOT NULL DEFAULT 'new',
    score INTEGER NOT NULL DEFAULT 0,
    score_breakdown_json JSONB,
    consent_marketing BOOLEAN NOT NULL DEFAULT FALSE,
    consent_ai BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_locale VARCHAR(16) NOT NULL DEFAULT 'en',
    assigned_broker_id UUID REFERENCES proppilot.broker (id),
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_tenant ON proppilot.lead (tenant_id);
CREATE INDEX IF NOT EXISTS idx_lead_tenant_source ON proppilot.lead (tenant_id, source);
CREATE INDEX IF NOT EXISTS idx_lead_tenant_state ON proppilot.lead (tenant_id, state);
CREATE INDEX IF NOT EXISTS idx_lead_broker ON proppilot.lead (assigned_broker_id);

CREATE TABLE IF NOT EXISTS proppilot.property (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    external_ref VARCHAR(128),
    title VARCHAR(512) NOT NULL,
    description TEXT,
    property_type VARCHAR(64) NOT NULL,
    listing_type VARCHAR(32) NOT NULL DEFAULT 'sale',
    status VARCHAR(32) NOT NULL DEFAULT 'available',
    city VARCHAR(128),
    district VARCHAR(128),
    country_code CHAR(2) NOT NULL DEFAULT 'AE',
    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqm NUMERIC(12, 2),
    price_amount NUMERIC(14, 2),
    price_currency CHAR(3) NOT NULL DEFAULT 'AED',
    amenities_json JSONB,
    media_json JSONB,
    facts_json JSONB,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_property_tenant ON proppilot.property (tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_search ON proppilot.property (tenant_id, city, property_type, listing_type, status);
CREATE INDEX IF NOT EXISTS idx_property_price ON proppilot.property (tenant_id, price_amount);

CREATE TABLE IF NOT EXISTS proppilot.viewing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    lead_id UUID NOT NULL REFERENCES proppilot.lead (id),
    property_id UUID NOT NULL REFERENCES proppilot.property (id),
    broker_id UUID REFERENCES proppilot.broker (id),
    status VARCHAR(32) NOT NULL DEFAULT 'requested',
    scheduled_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    notes TEXT,
    reminder_meta_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_viewing_tenant ON proppilot.viewing (tenant_id);
CREATE INDEX IF NOT EXISTS idx_viewing_lead ON proppilot.viewing (lead_id);
CREATE INDEX IF NOT EXISTS idx_viewing_property ON proppilot.viewing (property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_scheduled ON proppilot.viewing (tenant_id, scheduled_at);

-- Feature flags: kill switch, channel/source/broker scopes; shadow_mode default ON.
CREATE TABLE IF NOT EXISTS proppilot.feature_flag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    flag_key VARCHAR(128) NOT NULL,
    scope_type VARCHAR(32) NOT NULL DEFAULT 'global',
    scope_value VARCHAR(128),
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    shadow_mode BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(512),
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_feature_flag
  ON proppilot.feature_flag (tenant_id, flag_key, scope_type, COALESCE(scope_value, ''));
CREATE INDEX IF NOT EXISTS idx_feature_flag_lookup
  ON proppilot.feature_flag (tenant_id, flag_key, scope_type, scope_value);

CREATE TABLE IF NOT EXISTS proppilot.tool_call_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    correlation_id VARCHAR(128),
    conversation_id UUID,
    lead_id UUID,
    agent_name VARCHAR(128),
    tool_name VARCHAR(128) NOT NULL,
    call_type VARCHAR(32) NOT NULL DEFAULT 'tool',
    status VARCHAR(32) NOT NULL DEFAULT 'ok',
    input_masked TEXT,
    output_masked TEXT,
    error_message TEXT,
    latency_ms BIGINT,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_usd NUMERIC(12, 6),
    model_name VARCHAR(128),
    pii_masked BOOLEAN NOT NULL DEFAULT TRUE,
    metadata_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_tenant_created ON proppilot.tool_call_audit (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_lead ON proppilot.tool_call_audit (lead_id);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_correlation ON proppilot.tool_call_audit (correlation_id);
CREATE INDEX IF NOT EXISTS idx_tool_call_audit_tool ON proppilot.tool_call_audit (tenant_id, tool_name, created_at DESC);

CREATE TABLE IF NOT EXISTS proppilot.stored_object (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(64) NOT NULL,
    bucket VARCHAR(128) NOT NULL,
    object_key VARCHAR(1024) NOT NULL,
    content_type VARCHAR(255),
    size_bytes BIGINT,
    checksum_sha256 VARCHAR(64),
    purpose VARCHAR(64) NOT NULL DEFAULT 'generic',
    related_entity_type VARCHAR(64),
    related_entity_id UUID,
    metadata_json JSONB,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_stored_object_bucket_key ON proppilot.stored_object (bucket, object_key);
CREATE INDEX IF NOT EXISTS idx_stored_object_tenant ON proppilot.stored_object (tenant_id);
CREATE INDEX IF NOT EXISTS idx_stored_object_purpose ON proppilot.stored_object (tenant_id, purpose);
CREATE INDEX IF NOT EXISTS idx_stored_object_related ON proppilot.stored_object (related_entity_type, related_entity_id);

-- Seed flags (shadow on; AI off until explicitly enabled)
INSERT INTO proppilot.feature_flag (tenant_id, flag_key, scope_type, scope_value, is_enabled, shadow_mode, description)
VALUES
  ('default', 'ai.kill_switch', 'global', NULL, FALSE, TRUE, 'When enabled, short-circuits all AI orchestration'),
  ('default', 'ai.orchestrator', 'global', NULL, FALSE, TRUE, 'Master AI orchestrator; default off + shadow'),
  ('default', 'channel.whatsapp', 'channel', 'whatsapp', FALSE, TRUE, 'WhatsApp channel'),
  ('default', 'channel.telegram', 'channel', 'telegram', FALSE, TRUE, 'Telegram channel'),
  ('default', 'channel.web', 'channel', 'web', FALSE, TRUE, 'Web chat channel'),
  ('default', 'channel.email', 'channel', 'email', FALSE, TRUE, 'Email channel')
ON CONFLICT DO NOTHING;

-- Minimal synthetic domain seed
INSERT INTO proppilot.broker (id, tenant_id, external_ref, display_name, email, phone, notification_endpoint, working_hours_json, active)
VALUES (
  '11111111-1111-1111-1111-111111111101',
  'default',
  'broker-demo-1',
  'Aisha Rahman',
  'aisha@example.com',
  '+971500000001',
  'https://hooks.example.com/brokers/aisha',
  '{"timezone":"Asia/Dubai","mon":["09:00-18:00"]}'::jsonb,
  TRUE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO proppilot.property (
  id, tenant_id, external_ref, title, description, property_type, listing_type, status,
  city, district, country_code, bedrooms, bathrooms, area_sqm, price_amount, price_currency,
  amenities_json, facts_json, active
) VALUES (
  '22222222-2222-2222-2222-222222222201',
  'default',
  'prop-demo-marina-1',
  'Marina Vista 2BR',
  'Bright two-bedroom apartment overlooking Dubai Marina.',
  'apartment',
  'rent',
  'available',
  'Dubai',
  'Dubai Marina',
  'AE',
  2, 2, 115.50, 145000.00, 'AED',
  '["parking","gym","pool"]'::jsonb,
  '{"furnished":true,"floor":18,"view":"marina"}'::jsonb,
  TRUE
) ON CONFLICT (id) DO NOTHING;

INSERT INTO proppilot.lead (
  id, tenant_id, external_ref, full_name, email, phone, source, state, score,
  score_breakdown_json, consent_marketing, consent_ai, preferred_locale, assigned_broker_id
) VALUES (
  '33333333-3333-3333-3333-333333333301',
  'default',
  'lead-demo-1',
  'Omar Hassan',
  'omar@example.com',
  '+971500000099',
  'web_form',
  'new',
  42,
  '{"budget_fit":20,"urgency":12,"engagement":10}'::jsonb,
  TRUE, TRUE, 'en',
  '11111111-1111-1111-1111-111111111101'
) ON CONFLICT (id) DO NOTHING;
