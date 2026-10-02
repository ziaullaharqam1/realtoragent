import { describe, expect, it } from "vitest";
import { maskPii, maskPiiDeep } from "@/lib/ai-agent/audit/pii";

describe("maskPii", () => {
  it("masks emails and phones in free text", () => {
    const masked = maskPii("Contact omar@example.com or +971 50 000 0099 today");
    expect(masked).toContain("[EMAIL]");
    expect(masked).toContain("[PHONE]");
    expect(masked).not.toContain("omar@example.com");
  });

  it("redacts sensitive object keys", () => {
    const masked = maskPiiDeep({
      email: "a@b.com",
      phone: "+971500000001",
      note: "reach me at a@b.com",
      nested: { password: "secret" },
    }) as Record<string, unknown>;
    expect(masked.email).toBe("[REDACTED]");
    expect(masked.phone).toBe("[REDACTED]");
    expect(masked.note).toBe("reach me at [EMAIL]");
    expect((masked.nested as Record<string, unknown>).password).toBe("[REDACTED]");
  });
});
