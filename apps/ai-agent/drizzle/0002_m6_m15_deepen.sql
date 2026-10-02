-- Migration: 0002_m6_m15_deepen
-- Purpose: Nurture jobs + presentation view analytics (Postgres path).
-- Expand: additive CREATE TABLE only.
-- Contract / rollback (dev only):
--   DROP TABLE IF EXISTS proppilot.nurture_job, proppilot.presentation_view;
-- Note: Demo mode uses in-memory store; apply when DATABASE_URL points at Postgres.

CREATE TABLE IF NOT EXISTS proppilot.nurture_job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  lead_id UUID NOT NULL,
  channel VARCHAR(32) NOT NULL DEFAULT 'web',
  destination VARCHAR(320) NOT NULL,
  template TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  due_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  last_error TEXT
);
CREATE INDEX IF NOT EXISTS idx_nurture_due
  ON proppilot.nurture_job (tenant_id, status, due_at);

CREATE TABLE IF NOT EXISTS proppilot.presentation_view (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(64) NOT NULL,
  presentation_id UUID NOT NULL,
  lead_id UUID,
  source VARCHAR(64) NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_presentation_view
  ON proppilot.presentation_view (tenant_id, presentation_id, created_at DESC);
