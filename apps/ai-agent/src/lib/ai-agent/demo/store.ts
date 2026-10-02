import { randomUUID } from "node:crypto";
import { defaultTenantId } from "./mode";

export type DemoBroker = {
  id: string;
  tenantId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  notificationEndpoint: string | null;
  workingHours: unknown;
  active: boolean;
};

export type DemoLead = {
  id: string;
  tenantId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  state: string;
  score: number;
  scoreBreakdown: Record<string, unknown> | null;
  consentMarketing: boolean;
  consentAi: boolean;
  preferredLocale: string;
  assignedBrokerId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type DemoProperty = {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  propertyType: string;
  listingType: string;
  status: string;
  city: string | null;
  district: string | null;
  countryCode: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: string | null;
  priceAmount: string | null;
  priceCurrency: string;
  amenities: unknown;
  media: unknown;
  facts: unknown;
  active: boolean;
};

export type DemoViewing = {
  id: string;
  tenantId: string;
  leadId: string;
  propertyId: string;
  brokerId: string | null;
  status: string;
  scheduledAt: string | null;
  endsAt: string | null;
  notes: string | null;
};

export type DemoFlag = {
  id: string;
  tenantId: string;
  flagKey: string;
  scopeType: string;
  scopeValue: string | null;
  isEnabled: boolean;
  shadowMode: boolean;
  description: string | null;
};

export type DemoConversation = {
  id: string;
  tenantId: string;
  leadId: string | null;
  channel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type DemoMessage = {
  id: string;
  conversationId: string;
  tenantId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type DemoShadowApproval = {
  id: string;
  tenantId: string;
  conversationId: string | null;
  leadId: string | null;
  channel: string;
  draftPayload: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  decisionNote: string | null;
  createdAt: string;
  decidedAt: string | null;
};

export type DemoPresentation = {
  id: string;
  tenantId: string;
  leadId: string | null;
  title: string;
  spec: Record<string, unknown>;
  createdAt: string;
};

export type DemoEmbedding = {
  id: string;
  tenantId: string;
  propertyId: string;
  model: string;
  dims: number;
  vector: number[];
  textHash: string;
  updatedAt: string;
};

export type DemoAudit = {
  id: string;
  tenantId: string;
  correlationId: string | null;
  conversationId: string | null;
  leadId: string | null;
  agentName: string | null;
  toolName: string;
  callType: string;
  status: string;
  inputMasked: string | null;
  outputMasked: string | null;
  errorMessage: string | null;
  latencyMs: number | null;
  modelName: string | null;
  createdAt: string;
};

export type DemoOutboxItem = {
  id: string;
  tenantId: string;
  channel: string;
  destination: string;
  payload: Record<string, unknown>;
  status: "pending" | "sent" | "failed";
  createdAt: string;
  sentAt: string | null;
};

export type DemoN8nEvent = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  signature: string | null;
  createdAt: string;
};

export type DemoStore = {
  brokers: DemoBroker[];
  leads: DemoLead[];
  properties: DemoProperty[];
  viewings: DemoViewing[];
  flags: DemoFlag[];
  conversations: DemoConversation[];
  messages: DemoMessage[];
  approvals: DemoShadowApproval[];
  presentations: DemoPresentation[];
  embeddings: DemoEmbedding[];
  audits: DemoAudit[];
  outbox: DemoOutboxItem[];
  n8nEvents: DemoN8nEvent[];
};

const TENANT = "default";

const BROKER_A = "11111111-1111-4111-8111-111111111111";
const BROKER_B = "22222222-2222-4222-8222-222222222222";
const LEAD_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const LEAD_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const PROP_MARINA = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const PROP_JLT = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const PROP_HILLS = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const CONV_A = "ffffffff-ffff-4fff-8fff-ffffffffffff";

function nowIso(): string {
  return new Date().toISOString();
}

function seedStore(): DemoStore {
  const ts = nowIso();
  return {
    brokers: [
      {
        id: BROKER_A,
        tenantId: TENANT,
        displayName: "Sara Al Maktoum",
        email: "sara@proppilot.demo",
        phone: "+971501111111",
        notificationEndpoint: "https://hooks.proppilot.demo/brokers/sara",
        workingHours: { timezone: "Asia/Dubai", days: ["Sun", "Mon", "Tue", "Wed", "Thu"] },
        active: true,
      },
      {
        id: BROKER_B,
        tenantId: TENANT,
        displayName: "Omar Rahman",
        email: "omar@proppilot.demo",
        phone: "+971502222222",
        notificationEndpoint: "https://hooks.proppilot.demo/brokers/omar",
        workingHours: { timezone: "Asia/Dubai", days: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
        active: true,
      },
    ],
    leads: [
      {
        id: LEAD_A,
        tenantId: TENANT,
        fullName: "Alex Chen",
        email: "alex.chen@example.com",
        phone: "+971555010101",
        source: "web_chat",
        state: "qualifying",
        score: 62,
        scoreBreakdown: { budget: 20, timeline: 18, engagement: 24 },
        consentMarketing: true,
        consentAi: true,
        preferredLocale: "en",
        assignedBrokerId: null,
        metadata: { interest: "Marina apartments" },
        createdAt: ts,
        updatedAt: ts,
      },
      {
        id: LEAD_B,
        tenantId: TENANT,
        fullName: "Priya Nair",
        email: "priya.nair@example.com",
        phone: "+971555020202",
        source: "bayut",
        state: "new",
        score: 40,
        scoreBreakdown: { budget: 15, timeline: 10, engagement: 15 },
        consentMarketing: true,
        consentAi: true,
        preferredLocale: "en",
        assignedBrokerId: BROKER_A,
        metadata: { interest: "family villa" },
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    properties: [
      {
        id: PROP_MARINA,
        tenantId: TENANT,
        title: "Marina Gate Tower 2 — 2BR with sea view",
        description:
          "Bright 2-bedroom apartment in Dubai Marina with full marina and partial sea views, upgraded kitchen, and two parking spaces.",
        propertyType: "apartment",
        listingType: "sale",
        status: "available",
        city: "Dubai",
        district: "Dubai Marina",
        countryCode: "AE",
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: "118.00",
        priceAmount: "2450000",
        priceCurrency: "AED",
        amenities: ["pool", "gym", "concierge", "parking"],
        media: [{ type: "image", url: "/media/marina-gate.jpg" }],
        facts: {
          yearBuilt: 2019,
          parkingSpaces: 2,
          view: "marina_sea",
          furnished: "semi",
        },
        active: true,
      },
      {
        id: PROP_JLT,
        tenantId: TENANT,
        title: "JLT Cluster Y — 1BR investor unit",
        description:
          "Efficient 1-bedroom overlooking the lakes in Jumeirah Lake Towers. Strong rental demand and walkable to metro.",
        propertyType: "apartment",
        listingType: "sale",
        status: "available",
        city: "Dubai",
        district: "Jumeirah Lake Towers",
        countryCode: "AE",
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: "72.50",
        priceAmount: "1180000",
        priceCurrency: "AED",
        amenities: ["pool", "gym", "metro_nearby"],
        media: [{ type: "image", url: "/media/jlt-y.jpg" }],
        facts: {
          yearBuilt: 2014,
          parkingSpaces: 1,
          view: "lake",
          furnished: "unfurnished",
        },
        active: true,
      },
      {
        id: PROP_HILLS,
        tenantId: TENANT,
        title: "Damac Hills — 4BR townhouse with garden",
        description:
          "Spacious family townhouse with private garden, maid's room, and community parks near the golf course.",
        propertyType: "townhouse",
        listingType: "sale",
        status: "available",
        city: "Dubai",
        district: "Damac Hills",
        countryCode: "AE",
        bedrooms: 4,
        bathrooms: 5,
        areaSqm: "265.00",
        priceAmount: "3900000",
        priceCurrency: "AED",
        amenities: ["garden", "community_pool", "golf_nearby", "parking"],
        media: [{ type: "image", url: "/media/damac-hills.jpg" }],
        facts: {
          yearBuilt: 2021,
          parkingSpaces: 2,
          view: "garden",
          furnished: "unfurnished",
        },
        active: true,
      },
    ],
    viewings: [],
    flags: [
      {
        id: randomUUID(),
        tenantId: TENANT,
        flagKey: "ai.kill_switch",
        scopeType: "global",
        scopeValue: null,
        isEnabled: false,
        shadowMode: false,
        description: "When enabled, short-circuits all AI orchestration",
      },
      {
        id: randomUUID(),
        tenantId: TENANT,
        flagKey: "ai.orchestrator",
        scopeType: "global",
        scopeValue: null,
        isEnabled: true,
        shadowMode: false,
        description: "Master AI orchestrator — enabled for demo",
      },
      {
        id: randomUUID(),
        tenantId: TENANT,
        flagKey: "channel.web",
        scopeType: "global",
        scopeValue: null,
        isEnabled: true,
        shadowMode: false,
        description: "Web chat channel",
      },
      {
        id: randomUUID(),
        tenantId: TENANT,
        flagKey: "channel.whatsapp",
        scopeType: "global",
        scopeValue: null,
        isEnabled: false,
        shadowMode: true,
        description: "WhatsApp channel stub",
      },
      {
        id: randomUUID(),
        tenantId: TENANT,
        flagKey: "channel.telegram",
        scopeType: "global",
        scopeValue: null,
        isEnabled: false,
        shadowMode: true,
        description: "Telegram channel stub",
      },
      {
        id: randomUUID(),
        tenantId: TENANT,
        flagKey: "channel.email",
        scopeType: "global",
        scopeValue: null,
        isEnabled: false,
        shadowMode: true,
        description: "Email channel stub",
      },
    ],
    conversations: [
      {
        id: CONV_A,
        tenantId: TENANT,
        leadId: LEAD_A,
        channel: "web",
        status: "open",
        createdAt: ts,
        updatedAt: ts,
      },
    ],
    messages: [
      {
        id: randomUUID(),
        conversationId: CONV_A,
        tenantId: TENANT,
        role: "assistant",
        content:
          "Welcome to PropPilot. I can help qualify your search, match listings in Dubai, and book viewings with a broker.",
        metadata: null,
        createdAt: ts,
      },
    ],
    approvals: [],
    presentations: [],
    embeddings: [],
    audits: [],
    outbox: [],
    n8nEvents: [],
  };
}

const globalForDemo = globalThis as unknown as {
  __proppilotDemoStore?: DemoStore;
};

export function getDemoStore(): DemoStore {
  if (!globalForDemo.__proppilotDemoStore) {
    globalForDemo.__proppilotDemoStore = seedStore();
  }
  return globalForDemo.__proppilotDemoStore;
}

/** Test helper — reset singleton between suites. */
export function resetDemoStore(): DemoStore {
  globalForDemo.__proppilotDemoStore = seedStore();
  return globalForDemo.__proppilotDemoStore;
}

export const DEMO_IDS = {
  tenant: TENANT,
  brokerA: BROKER_A,
  brokerB: BROKER_B,
  leadA: LEAD_A,
  leadB: LEAD_B,
  propMarina: PROP_MARINA,
  propJlt: PROP_JLT,
  propHills: PROP_HILLS,
  conversationA: CONV_A,
} as const;

export function newId(): string {
  return randomUUID();
}

export function tenantOrDefault(tenantId?: string | null): string {
  return tenantId && tenantId.length > 0 ? tenantId : defaultTenantId();
}
