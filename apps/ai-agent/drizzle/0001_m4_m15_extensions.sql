-- Migration: 0001_m4_m15_extensions
-- Purpose: Channel identity, consent, idempotency, outbox attempts, conversation takeover fields.
-- Expand: additive CREATE TABLE / ALTER TABLE only.
-- Contract / rollback (dev only):
--   DROP TABLE IF EXISTS proppilot.channel_identity, proppilot.consent_record, proppilot.idempotency_key;
--   ALTER TABLE proppilot.conversation DROP COLUMN IF EXISTS owner, DROP COLUMN IF EXISTS assigned_broker_id;
--   ALTER TABLE proppilot.outbox_message DROP COLUMN IF EXISTS attempts, DROP COLUMN IF EXISTS last_error;
-- Production: never drop; soft-delete / expand-contract only.
-- Note: Demo mode uses in-memory store; apply this when DATABASE_URL points at Postgres.

CREATE TABLE IF NOT EXISTS proppilot.channel_identity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  lead_id UUID NOT NULL,
  channel VARCHAR(32) NOT NULL,
  external_user_id VARCHAR(255) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_channel_identity
  ON proppilot.channel_identity (tenant_id, channel, external_user_id);

CREATE TABLE IF NOT EXISTS proppilot.consent_record (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  lead_id UUID NOT NULL,
  consent_type VARCHAR(32) NOT NULL,
  granted BOOLEAN NOT NULL,
  source VARCHAR(64) NOT NULL DEFAULT 'api',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consent_lead
  ON proppilot.consent_record (tenant_id, lead_id, consent_type, created_at DESC);

CREATE TABLE IF NOT EXISTS proppilot.idempotency_key (
  key VARCHAR(128) NOT NULL,
  tenant_id VARCHAR(64) NOT NULL,
  scope VARCHAR(64) NOT NULL,
  response_json TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (tenant_id, scope, key)
);
