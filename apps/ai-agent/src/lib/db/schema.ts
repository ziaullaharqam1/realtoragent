import {
  boolean,
  char,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
  uniqueIndex,
  bigint,
} from "drizzle-orm/pg-core";

export const proppilot = pgSchema("proppilot");

export const brokers = proppilot.table(
  "broker",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 }).notNull(),
    externalRef: varchar("external_ref", { length: 128 }),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 64 }),
    notificationEndpoint: varchar("notification_endpoint", { length: 512 }),
    workingHoursJson: jsonb("working_hours_json"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_broker_tenant").on(t.tenantId),
    index("idx_broker_tenant_active").on(t.tenantId, t.active),
  ],
);

export const leads = proppilot.table(
  "lead",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 }).notNull(),
    externalRef: varchar("external_ref", { length: 128 }),
    fullName: varchar("full_name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 64 }),
    source: varchar("source", { length: 64 }).notNull().default("unknown"),
    state: varchar("state", { length: 64 }).notNull().default("new"),
    score: integer("score").notNull().default(0),
    scoreBreakdownJson: jsonb("score_breakdown_json"),
    consentMarketing: boolean("consent_marketing").notNull().default(false),
    consentAi: boolean("consent_ai").notNull().default(false),
    preferredLocale: varchar("preferred_locale", { length: 16 }).notNull().default("en"),
    assignedBrokerId: uuid("assigned_broker_id"),
    metadataJson: jsonb("metadata_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_lead_tenant").on(t.tenantId),
    index("idx_lead_tenant_source").on(t.tenantId, t.source),
    index("idx_lead_tenant_state").on(t.tenantId, t.state),
    index("idx_lead_broker").on(t.assignedBrokerId),
  ],
);

export const properties = proppilot.table(
  "property",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 }).notNull(),
    externalRef: varchar("external_ref", { length: 128 }),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description"),
    propertyType: varchar("property_type", { length: 64 }).notNull(),
    listingType: varchar("listing_type", { length: 32 }).notNull().default("sale"),
    status: varchar("status", { length: 32 }).notNull().default("available"),
    city: varchar("city", { length: 128 }),
    district: varchar("district", { length: 128 }),
    countryCode: char("country_code", { length: 2 }).notNull().default("AE"),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    areaSqm: numeric("area_sqm", { precision: 12, scale: 2 }),
    priceAmount: numeric("price_amount", { precision: 14, scale: 2 }),
    priceCurrency: char("price_currency", { length: 3 }).notNull().default("AED"),
    amenitiesJson: jsonb("amenities_json"),
    mediaJson: jsonb("media_json"),
    factsJson: jsonb("facts_json"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_property_tenant").on(t.tenantId),
    index("idx_property_search").on(t.tenantId, t.city, t.propertyType, t.listingType, t.status),
    index("idx_property_price").on(t.tenantId, t.priceAmount),
  ],
);

export const viewings = proppilot.table(
  "viewing",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 }).notNull(),
    leadId: uuid("lead_id").notNull(),
    propertyId: uuid("property_id").notNull(),
    brokerId: uuid("broker_id"),
    status: varchar("status", { length: 32 }).notNull().default("requested"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    notes: text("notes"),
    reminderMetaJson: jsonb("reminder_meta_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_viewing_tenant").on(t.tenantId),
    index("idx_viewing_lead").on(t.leadId),
    index("idx_viewing_property").on(t.propertyId),
    index("idx_viewing_scheduled").on(t.tenantId, t.scheduledAt),
  ],
);

export const featureFlags = proppilot.table(
  "feature_flag",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 }).notNull(),
    flagKey: varchar("flag_key", { length: 128 }).notNull(),
    scopeType: varchar("scope_type", { length: 32 }).notNull().default("global"),
    scopeValue: varchar("scope_value", { length: 128 }),
    isEnabled: boolean("is_enabled").notNull().default(false),
    shadowMode: boolean("shadow_mode").notNull().default(true),
    description: varchar("description", { length: 512 }),
    metadataJson: jsonb("metadata_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_feature_flag").on(t.tenantId, t.flagKey, t.scopeType, t.scopeValue),
    index("idx_feature_flag_lookup").on(t.tenantId, t.flagKey, t.scopeType, t.scopeValue),
  ],
);

export const toolCallAudits = proppilot.table(
  "tool_call_audit",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 }).notNull(),
    correlationId: varchar("correlation_id", { length: 128 }),
    conversationId: uuid("conversation_id"),
    leadId: uuid("lead_id"),
    agentName: varchar("agent_name", { length: 128 }),
    toolName: varchar("tool_name", { length: 128 }).notNull(),
    callType: varchar("call_type", { length: 32 }).notNull().default("tool"),
    status: varchar("status", { length: 32 }).notNull().default("ok"),
    inputMasked: text("input_masked"),
    outputMasked: text("output_masked"),
    errorMessage: text("error_message"),
    latencyMs: bigint("latency_ms", { mode: "number" }),
    promptTokens: integer("prompt_tokens"),
    completionTokens: integer("completion_tokens"),
    totalTokens: integer("total_tokens"),
    costUsd: numeric("cost_usd", { precision: 12, scale: 6 }),
    modelName: varchar("model_name", { length: 128 }),
    piiMasked: boolean("pii_masked").notNull().default(true),
    metadataJson: jsonb("metadata_json"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_tool_call_audit_tenant_created").on(t.tenantId, t.createdAt),
    index("idx_tool_call_audit_lead").on(t.leadId),
    index("idx_tool_call_audit_correlation").on(t.correlationId),
    index("idx_tool_call_audit_tool").on(t.tenantId, t.toolName, t.createdAt),
  ],
);

export const storedObjects = proppilot.table(
  "stored_object",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 }).notNull(),
    bucket: varchar("bucket", { length: 128 }).notNull(),
    objectKey: varchar("object_key", { length: 1024 }).notNull(),
    contentType: varchar("content_type", { length: 255 }),
    sizeBytes: bigint("size_bytes", { mode: "number" }),
    checksumSha256: varchar("checksum_sha256", { length: 64 }),
    purpose: varchar("purpose", { length: 64 }).notNull().default("generic"),
    relatedEntityType: varchar("related_entity_type", { length: 64 }),
    relatedEntityId: uuid("related_entity_id"),
    metadataJson: jsonb("metadata_json"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_stored_object_bucket_key").on(t.bucket, t.objectKey),
    index("idx_stored_object_tenant").on(t.tenantId),
    index("idx_stored_object_purpose").on(t.tenantId, t.purpose),
    index("idx_stored_object_related").on(t.relatedEntityType, t.relatedEntityId),
  ],
);

export type Lead = typeof leads.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Viewing = typeof viewings.$inferSelect;
export type Broker = typeof brokers.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type ToolCallAudit = typeof toolCallAudits.$inferSelect;
export type StoredObject = typeof storedObjects.$inferSelect;
