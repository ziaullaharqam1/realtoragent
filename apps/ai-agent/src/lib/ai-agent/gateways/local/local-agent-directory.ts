import { and, eq } from "drizzle-orm";
import type { AppDb } from "@/lib/db/client";
import { brokers, leads } from "@/lib/db/schema";
import type { AgentDirectory, BrokerProfile } from "../agent-directory";

function mapBroker(row: typeof brokers.$inferSelect): BrokerProfile {
  return {
    id: row.id,
    tenantId: row.tenantId,
    displayName: row.displayName,
    email: row.email,
    phone: row.phone,
    notificationEndpoint: row.notificationEndpoint,
    workingHours: row.workingHoursJson,
    active: row.active,
  };
}

export class LocalAgentDirectory implements AgentDirectory {
  constructor(private readonly db: AppDb) {}

  async listActive(tenantId: string): Promise<BrokerProfile[]> {
    const rows = await this.db
      .select()
      .from(brokers)
      .where(and(eq(brokers.tenantId, tenantId), eq(brokers.active, true)));
    return rows.map(mapBroker);
  }

  async getById(tenantId: string, brokerId: string): Promise<BrokerProfile | null> {
    const rows = await this.db
      .select()
      .from(brokers)
      .where(and(eq(brokers.tenantId, tenantId), eq(brokers.id, brokerId)))
      .limit(1);
    return rows[0] ? mapBroker(rows[0]) : null;
  }

  async assignLead(tenantId: string, leadId: string, brokerId: string): Promise<void> {
    const broker = await this.getById(tenantId, brokerId);
    if (!broker) throw new Error(`Broker not found: ${brokerId}`);
    const updated = await this.db
      .update(leads)
      .set({ assignedBrokerId: brokerId, updatedAt: new Date() })
      .where(and(eq(leads.tenantId, tenantId), eq(leads.id, leadId)))
      .returning({ id: leads.id });
    if (!updated[0]) throw new Error(`Lead not found: ${leadId}`);
  }
}
