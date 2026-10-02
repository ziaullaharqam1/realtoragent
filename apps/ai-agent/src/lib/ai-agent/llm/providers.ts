export type LlmProviderId = "grok" | "openai" | "openrouter-free" | "custom" | "mock";

export type LlmProviderPreset = {
  id: LlmProviderId;
  label: string;
  detail: string;
  baseUrl: string;
  model: string;
  /** Env keys checked for API key (first wins). */
  apiKeyEnv: string[];
  freeTier: boolean;
};

/** Built-in LLM presets. Default is Grok (xAI) — free credits via console.x.ai data-sharing. */
export const LLM_PROVIDERS: LlmProviderPreset[] = [
  {
    id: "grok",
    label: "Grok (xAI — default / free credits)",
    detail: "OpenAI-compatible https://api.x.ai/v1 — use XAI_API_KEY from console.x.ai",
    baseUrl: "https://api.x.ai/v1",
    model: "grok-3-mini",
    apiKeyEnv: ["XAI_API_KEY", "GROK_API_KEY", "LLM_API_KEY"],
    freeTier: true,
  },
  {
    id: "openrouter-free",
    label: "OpenRouter free router",
    detail: "Zero-cost router (openrouter/free) — set OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "openrouter/free",
    apiKeyEnv: ["OPENROUTER_API_KEY", "LLM_API_KEY"],
    freeTier: true,
  },
  {
    id: "openai",
    label: "OpenAI",
    detail: "api.openai.com chat completions",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKeyEnv: ["OPENAI_API_KEY", "LLM_API_KEY"],
    freeTier: false,
  },
  {
    id: "custom",
    label: "Custom OpenAI-compatible",
    detail: "Any /v1 chat completions endpoint",
    baseUrl: "",
    model: "gpt-4o-mini",
    apiKeyEnv: ["LLM_API_KEY"],
    freeTier: false,
  },
  {
    id: "mock",
    label: "Mock (offline demo)",
    detail: "Deterministic local LLM — no network",
    baseUrl: "",
    model: "mock-llm",
    apiKeyEnv: [],
    freeTier: true,
  },
];

export const DEFAULT_LLM_PROVIDER: LlmProviderId = "grok";

export function getProviderPreset(id: string | null | undefined): LlmProviderPreset {
  return LLM_PROVIDERS.find((p) => p.id === id) ?? LLM_PROVIDERS[0]!;
}

export type ResolvedLlmConfig = {
  provider: LlmProviderId;
  enabled: boolean;
  baseUrl: string;
  model: string;
  apiKey: string;
  fallbackToMock: boolean;
  source: "env" | "settings" | "default";
};

function firstEnv(keys: string[]): string {
  for (const key of keys) {
    const v = process.env[key];
    if (v && v.trim()) return v.trim();
  }
  return "";
}

export type LlmSettingsSlice = {
  enabled?: boolean;
  provider?: string;
  model?: string;
  baseUrl?: string;
  apiKey?: string;
  fallbackToMock?: boolean;
};

/**
 * Resolve LLM config: settings overlay env, Grok is the default provider.
 * API key preference: settings key (if not masked) → provider env vars → LLM_API_KEY.
 */
export function resolveLlmConfig(settings?: LlmSettingsSlice | null): ResolvedLlmConfig {
  const envProvider = (process.env.LLM_PROVIDER ?? DEFAULT_LLM_PROVIDER).toLowerCase();
  const providerId = (settings?.provider || envProvider || DEFAULT_LLM_PROVIDER) as LlmProviderId;
  const preset = getProviderPreset(providerId);

  const envEnabled = (process.env.LLM_ENABLED ?? "").toLowerCase();
  // Default: enabled for grok/free providers unless explicitly false
  let enabled =
    envEnabled === "true"
      ? true
      : envEnabled === "false"
        ? false
        : settings?.enabled ?? (preset.id !== "mock");

  const model =
    settings?.model?.trim() ||
    process.env.LLM_MODEL?.trim() ||
    preset.model;

  const baseUrl =
    settings?.baseUrl?.trim() ||
    process.env.LLM_BASE_URL?.trim() ||
    preset.baseUrl;

  const settingsKey = settings?.apiKey?.trim() ?? "";
  const looksMasked = settingsKey.includes("*") || settingsKey === "****";
  const apiKey =
    (!looksMasked && settingsKey) ||
    firstEnv(preset.apiKeyEnv) ||
    firstEnv(["LLM_API_KEY"]);

  const fallbackToMock =
    settings?.fallbackToMock ??
    (process.env.LLM_FALLBACK_MOCK ?? "true").toLowerCase() !== "false";

  if (preset.id === "mock") {
    enabled = true;
  }

  return {
    provider: preset.id,
    enabled,
    baseUrl,
    model,
    apiKey,
    fallbackToMock,
    source: settings?.provider || settings?.apiKey ? "settings" : process.env.LLM_PROVIDER ? "env" : "default",
  };
}
