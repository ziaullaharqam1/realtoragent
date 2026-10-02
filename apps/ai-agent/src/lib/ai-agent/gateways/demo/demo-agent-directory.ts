import type { AgentDirectory, BrokerProfile } from "../agent-directory";
import { getDemoStore, type DemoBroker } from "../../demo/store";

function mapBroker(row: DemoBroker): BrokerProfile {
  return {
    id: row.id,
    tenantId: row.tenantId,
    displayName: row.displayName,
    email: row.email,
    phone: row.phone,
    notificationEndpoint: row.notificationEndpoint,
    workingHours: row.workingHours,
    active: row.active,
  };
}

export class DemoAgentDirectory implements AgentDirectory {
  async listActive(tenantId: string): Promise<BrokerProfile[]> {
    return getDemoStore()
      .brokers.filter((b) => b.tenantId === tenantId && b.active)
      .map(mapBroker);
  }

  async getById(tenantId: string, brokerId: string): Promise<BrokerProfile | null> {
    const row = getDemoStore().brokers.find((b) => b.tenantId === tenantId && b.id === brokerId);
    return row ? mapBroker(row) : null;
  }

  async assignLead(tenantId: string, leadId: string, brokerId: string): Promise<void> {
    const store = getDemoStore();
    const broker = store.brokers.find((b) => b.tenantId === tenantId && b.id === brokerId);
    if (!broker) throw new Error(`Broker not found: ${brokerId}`);
    const lead = store.leads.find((l) => l.tenantId === tenantId && l.id === leadId);
    if (!lead) throw new Error(`Lead not found: ${leadId}`);
    lead.assignedBrokerId = brokerId;
    lead.updatedAt = new Date().toISOString();
  }
}
