import type { AgentDirectory, BrokerProfile } from "../agent-directory";

export class HttpAgentDirectory implements AgentDirectory {
  constructor(private readonly baseUrl: string) {}

  async listActive(tenantId: string): Promise<BrokerProfile[]> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/brokers?active=true`);
    if (!res.ok) throw new Error(`HttpAgentDirectory listActive failed: ${res.status}`);
    return (await res.json()) as BrokerProfile[];
  }

  async getById(tenantId: string, brokerId: string): Promise<BrokerProfile | null> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/brokers/${brokerId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HttpAgentDirectory getById failed: ${res.status}`);
    return (await res.json()) as BrokerProfile;
  }

  async assignLead(tenantId: string, leadId: string, brokerId: string): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/tenants/${tenantId}/leads/${leadId}/assign`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brokerId }),
      },
    );
    if (!res.ok) throw new Error(`HttpAgentDirectory assignLead failed: ${res.status}`);
  }
}
