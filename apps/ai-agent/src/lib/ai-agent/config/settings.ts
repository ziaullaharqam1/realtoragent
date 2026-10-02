import { getDemoStore, type DemoSettings } from "@/lib/ai-agent/demo/store";

export type { DemoSettings };

export type ChannelCredentialConfig = {
  enabled: boolean;
  verifyToken: string;
  appSecret: string;
  accessToken: string;
  phoneNumberId: string;
  botToken: string;
  webhookSecret: string;
  webhookUrlHint: string;
};

export type LeadSourceCredential = {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  portalAccount: string;
  notes: string;
};

export type TriggerConfig = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  event: string;
};

export function defaultSettings(): DemoSettings {
  return {
    whatsapp: {
      enabled: false,
      verifyToken: "proppilot-demo",
      appSecret: "",
      accessToken: "",
      phoneNumberId: "",
      botToken: "",
      webhookSecret: "",
      webhookUrlHint: "/api/channels/whatsapp/webhook",
    },
    telegram: {
      enabled: false,
      verifyToken: "",
      appSecret: "",
      accessToken: "",
      phoneNumberId: "",
      botToken: "",
      webhookSecret: "",
      webhookUrlHint: "/api/channels/telegram/webhook",
    },
    email: {
      enabled: false,
      verifyToken: "",
      appSecret: "",
      accessToken: "",
      phoneNumberId: "",
      botToken: "",
      webhookSecret: "",
      webhookUrlHint: "/api/channels/email/webhook",
    },
    n8n: {
      webhookUrl: "",
      webhookSecret: "",
      enabled: false,
    },
    llm: {
      enabled: false,
      baseUrl: "",
      apiKey: "",
      embeddingUrl: "",
    },
    leadSources: [
      {
        id: "bayut",
        name: "Bayut",
        enabled: false,
        apiKey: "",
        apiSecret: "",
        portalAccount: "",
        notes: "Inbound lead webhooks from Bayut CRM",
      },
      {
        id: "property_finder",
        name: "Property Finder",
        enabled: false,
        apiKey: "",
        apiSecret: "",
        portalAccount: "",
        notes: "PF lead API key + agency id",
      },
      {
        id: "website_form",
        name: "Website form",
        enabled: true,
        apiKey: "demo-form-key",
        apiSecret: "",
        portalAccount: "proppilot-web",
        notes: "POST /api/webhooks/leads",
      },
    ],
    triggers: [
      {
        id: "lead_created",
        name: "Lead created",
        description: "Emit n8n event + optional auto-qualify",
        enabled: true,
        event: "lead.created",
      },
      {
        id: "inbound_whatsapp",
        name: "WhatsApp inbound",
        description: "Process WA webhook messages through orchestrator",
        enabled: false,
        event: "channel.whatsapp.inbound",
      },
      {
        id: "inbound_telegram",
        name: "Telegram inbound",
        description: "Process Telegram updates through orchestrator",
        enabled: false,
        event: "channel.telegram.inbound",
      },
      {
        id: "nurture_due",
        name: "Nurture due",
        description: "Drain nurture jobs on schedule / n8n command",
        enabled: true,
        event: "lead.nurture",
      },
      {
        id: "embedding_refresh",
        name: "Embedding refresh",
        description: "Refresh property vectors after inventory sync",
        enabled: true,
        event: "embeddings.refresh",
      },
      {
        id: "shadow_approval",
        name: "Shadow approval required",
        description: "Hold outbound AI drafts for broker approval",
        enabled: true,
        event: "shadow.approval",
      },
      {
        id: "presentation_ready",
        name: "Presentation ready",
        description: "Notify when Studio builds a deck",
        enabled: true,
        event: "presentation.ready",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function getSettings(): DemoSettings {
  const store = getDemoStore();
  if (!store.settings) {
    store.settings = defaultSettings();
  }
  return store.settings;
}

export function updateSettings(patch: Partial<DemoSettings>): DemoSettings {
  const current = getSettings();
  const next: DemoSettings = {
    ...current,
    ...patch,
    whatsapp: { ...current.whatsapp, ...(patch.whatsapp ?? {}) },
    telegram: { ...current.telegram, ...(patch.telegram ?? {}) },
    email: { ...current.email, ...(patch.email ?? {}) },
    n8n: { ...current.n8n, ...(patch.n8n ?? {}) },
    llm: { ...current.llm, ...(patch.llm ?? {}) },
    leadSources: patch.leadSources ?? current.leadSources,
    triggers: patch.triggers ?? current.triggers,
    updatedAt: new Date().toISOString(),
  };
  getDemoStore().settings = next;
  return next;
}

/** Mask secrets for UI responses. */
export function maskSettings(settings: DemoSettings): DemoSettings {
  const mask = (v: string) => (v && v.length > 4 ? `${"*".repeat(Math.min(8, v.length - 4))}${v.slice(-4)}` : v ? "****" : "");
  return {
    ...settings,
    whatsapp: {
      ...settings.whatsapp,
      appSecret: mask(settings.whatsapp.appSecret),
      accessToken: mask(settings.whatsapp.accessToken),
    },
    telegram: {
      ...settings.telegram,
      botToken: mask(settings.telegram.botToken),
      webhookSecret: mask(settings.telegram.webhookSecret),
    },
    email: {
      ...settings.email,
      accessToken: mask(settings.email.accessToken),
      appSecret: mask(settings.email.appSecret),
    },
    n8n: {
      ...settings.n8n,
      webhookSecret: mask(settings.n8n.webhookSecret),
    },
    llm: {
      ...settings.llm,
      apiKey: mask(settings.llm.apiKey),
    },
    leadSources: settings.leadSources.map((s) => ({
      ...s,
      apiKey: mask(s.apiKey),
      apiSecret: mask(s.apiSecret),
    })),
  };
}

export function applySettingsToEnvHints(settings: DemoSettings): void {
  // Demo: channel adapters read process.env first; settings fill gaps when unset.
  if (settings.whatsapp.verifyToken && !process.env.WHATSAPP_VERIFY_TOKEN) {
    process.env.WHATSAPP_VERIFY_TOKEN = settings.whatsapp.verifyToken;
  }
  if (settings.whatsapp.appSecret && !process.env.WHATSAPP_APP_SECRET) {
    process.env.WHATSAPP_APP_SECRET = settings.whatsapp.appSecret;
  }
  if (settings.whatsapp.accessToken && !process.env.WHATSAPP_ACCESS_TOKEN) {
    process.env.WHATSAPP_ACCESS_TOKEN = settings.whatsapp.accessToken;
  }
  if (settings.telegram.botToken && !process.env.TELEGRAM_BOT_TOKEN) {
    process.env.TELEGRAM_BOT_TOKEN = settings.telegram.botToken;
  }
  if (settings.telegram.webhookSecret && !process.env.TELEGRAM_WEBHOOK_SECRET) {
    process.env.TELEGRAM_WEBHOOK_SECRET = settings.telegram.webhookSecret;
  }
  if (settings.n8n.webhookSecret && !process.env.N8N_WEBHOOK_SECRET) {
    process.env.N8N_WEBHOOK_SECRET = settings.n8n.webhookSecret;
  }
  if (settings.n8n.webhookUrl && !process.env.N8N_WEBHOOK_URL) {
    process.env.N8N_WEBHOOK_URL = settings.n8n.webhookUrl;
  }
}
