import type { BookViewingInput, ViewingGateway, ViewingRecord } from "../viewing-gateway";
import { getDemoStore, newId, type DemoViewing } from "../../demo/store";

function mapViewing(row: DemoViewing): ViewingRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    leadId: row.leadId,
    propertyId: row.propertyId,
    brokerId: row.brokerId,
    status: row.status,
    scheduledAt: row.scheduledAt ? new Date(row.scheduledAt) : null,
    endsAt: row.endsAt ? new Date(row.endsAt) : null,
    notes: row.notes,
  };
}

export class DemoViewingGateway implements ViewingGateway {
  async getById(tenantId: string, viewingId: string): Promise<ViewingRecord | null> {
    const row = getDemoStore().viewings.find((v) => v.tenantId === tenantId && v.id === viewingId);
    return row ? mapViewing(row) : null;
  }

  async listForLead(tenantId: string, leadId: string): Promise<ViewingRecord[]> {
    return getDemoStore()
      .viewings.filter((v) => v.tenantId === tenantId && v.leadId === leadId)
      .map(mapViewing);
  }

  async book(tenantId: string, input: BookViewingInput): Promise<ViewingRecord> {
    const row: DemoViewing = {
      id: newId(),
      tenantId,
      leadId: input.leadId,
      propertyId: input.propertyId,
      brokerId: input.brokerId ?? null,
      status: "scheduled",
      scheduledAt: input.scheduledAt.toISOString(),
      endsAt: input.endsAt?.toISOString() ?? null,
      notes: input.notes ?? null,
    };
    getDemoStore().viewings.push(row);
    return mapViewing(row);
  }

  async reschedule(
    tenantId: string,
    viewingId: string,
    scheduledAt: Date,
    endsAt?: Date,
  ): Promise<ViewingRecord> {
    const store = getDemoStore();
    const row = store.viewings.find((v) => v.tenantId === tenantId && v.id === viewingId);
    if (!row) throw new Error(`Viewing not found: ${viewingId}`);
    row.scheduledAt = scheduledAt.toISOString();
    row.endsAt = endsAt?.toISOString() ?? null;
    row.status = "rescheduled";
    return mapViewing(row);
  }

  async cancel(tenantId: string, viewingId: string, reason?: string): Promise<ViewingRecord> {
    const store = getDemoStore();
    const row = store.viewings.find((v) => v.tenantId === tenantId && v.id === viewingId);
    if (!row) throw new Error(`Viewing not found: ${viewingId}`);
    row.status = "cancelled";
    row.notes = reason ?? row.notes;
    return mapViewing(row);
  }
}
