import { and, eq } from "drizzle-orm";
import type { AppDb } from "@/lib/db/client";
import { viewings } from "@/lib/db/schema";
import type {
  AvailabilityInput,
  BookViewingInput,
  ViewingAvailabilitySlot,
  ViewingGateway,
  ViewingRecord,
} from "../viewing-gateway";
import { generateAvailabilitySlots } from "@/lib/ai-agent/calendar/availability";

function mapViewing(row: typeof viewings.$inferSelect): ViewingRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    leadId: row.leadId,
    propertyId: row.propertyId,
    brokerId: row.brokerId,
    status: row.status,
    scheduledAt: row.scheduledAt,
    endsAt: row.endsAt,
    notes: row.notes,
  };
}

export class LocalViewingGateway implements ViewingGateway {
  constructor(private readonly db: AppDb) {}

  async getById(tenantId: string, viewingId: string): Promise<ViewingRecord | null> {
    const rows = await this.db
      .select()
      .from(viewings)
      .where(and(eq(viewings.tenantId, tenantId), eq(viewings.id, viewingId)))
      .limit(1);
    return rows[0] ? mapViewing(rows[0]) : null;
  }

  async listForLead(tenantId: string, leadId: string): Promise<ViewingRecord[]> {
    const rows = await this.db
      .select()
      .from(viewings)
      .where(and(eq(viewings.tenantId, tenantId), eq(viewings.leadId, leadId)));
    return rows.map(mapViewing);
  }

  async getAvailability(
    tenantId: string,
    input: AvailabilityInput,
  ): Promise<ViewingAvailabilitySlot[]> {
    const rows = await this.db
      .select()
      .from(viewings)
      .where(and(eq(viewings.tenantId, tenantId), eq(viewings.propertyId, input.propertyId)));
    const bookedStarts = rows
      .filter((v) => v.status !== "cancelled" && v.scheduledAt)
      .map((v) => v.scheduledAt!.toISOString());
    return generateAvailabilitySlots({
      tenantId,
      propertyId: input.propertyId,
      brokerId: input.brokerId ?? null,
      from: input.from,
      days: input.days ?? 5,
      bookedStarts,
    });
  }

  async book(tenantId: string, input: BookViewingInput): Promise<ViewingRecord> {
    const [row] = await this.db
      .insert(viewings)
      .values({
        tenantId,
        leadId: input.leadId,
        propertyId: input.propertyId,
        brokerId: input.brokerId,
        scheduledAt: input.scheduledAt,
        endsAt: input.endsAt,
        notes: input.notes,
        status: "scheduled",
      })
      .returning();
    return mapViewing(row);
  }

  async reschedule(
    tenantId: string,
    viewingId: string,
    scheduledAt: Date,
    endsAt?: Date,
  ): Promise<ViewingRecord> {
    const [row] = await this.db
      .update(viewings)
      .set({
        scheduledAt,
        endsAt: endsAt ?? null,
        status: "rescheduled",
        updatedAt: new Date(),
      })
      .where(and(eq(viewings.tenantId, tenantId), eq(viewings.id, viewingId)))
      .returning();
    if (!row) throw new Error(`Viewing not found: ${viewingId}`);
    return mapViewing(row);
  }

  async cancel(tenantId: string, viewingId: string, reason?: string): Promise<ViewingRecord> {
    const [row] = await this.db
      .update(viewings)
      .set({
        status: "cancelled",
        notes: reason,
        updatedAt: new Date(),
      })
      .where(and(eq(viewings.tenantId, tenantId), eq(viewings.id, viewingId)))
      .returning();
    if (!row) throw new Error(`Viewing not found: ${viewingId}`);
    return mapViewing(row);
  }
}
