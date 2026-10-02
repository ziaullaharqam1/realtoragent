import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_LLM_PROVIDER,
  resolveLlmConfig,
  getProviderPreset,
} from "@/lib/ai-agent/llm/providers";
import { createLlmClient } from "@/lib/ai-agent/llm/client";
import { resetDemoStore } from "@/lib/ai-agent/demo/store";

describe("LLM providers", () => {
  const prev = { ...process.env };

  beforeEach(() => {
    resetDemoStore();
    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_ENABLED;
    delete process.env.LLM_API_KEY;
    delete process.env.XAI_API_KEY;
    delete process.env.LLM_BASE_URL;
    delete process.env.LLM_MODEL;
  });

  afterEach(() => {
    process.env = { ...prev };
  });

  it("defaults to grok free-credits provider", () => {
    expect(DEFAULT_LLM_PROVIDER).toBe("grok");
    const preset = getProviderPreset("grok");
    expect(preset.baseUrl).toBe("https://api.x.ai/v1");
    expect(preset.freeTier).toBe(true);
    const config = resolveLlmConfig(null);
    expect(config.provider).toBe("grok");
    expect(config.model).toBe("grok-3-mini");
    expect(config.enabled).toBe(true);
  });

  it("reads XAI_API_KEY for grok", () => {
    process.env.XAI_API_KEY = "xai-test-key";
    const config = resolveLlmConfig({ provider: "grok", enabled: true });
    expect(config.apiKey).toBe("xai-test-key");
    expect(config.baseUrl).toContain("api.x.ai");
  });

  it("createLlmClient falls back to mock without key", async () => {
    const client = createLlmClient();
    const result = await client.complete({
      tenantId: "default",
      agentName: "Test",
      intentHint: "general",
      messages: [{ role: "user", content: "hello" }],
    });
    expect(result.modelName).toMatch(/mock/);
  });
});
