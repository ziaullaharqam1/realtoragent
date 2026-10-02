import type {
  AvailabilityInput,
  BookViewingInput,
  ViewingAvailabilitySlot,
  ViewingGateway,
  ViewingRecord,
} from "../viewing-gateway";

export class HttpViewingGateway implements ViewingGateway {
  constructor(private readonly baseUrl: string) {}

  async getById(tenantId: string, viewingId: string): Promise<ViewingRecord | null> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/viewings/${viewingId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HttpViewingGateway getById failed: ${res.status}`);
    return (await res.json()) as ViewingRecord;
  }

  async listForLead(tenantId: string, leadId: string): Promise<ViewingRecord[]> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/leads/${leadId}/viewings`);
    if (!res.ok) throw new Error(`HttpViewingGateway listForLead failed: ${res.status}`);
    return (await res.json()) as ViewingRecord[];
  }

  async getAvailability(
    tenantId: string,
    input: AvailabilityInput,
  ): Promise<ViewingAvailabilitySlot[]> {
    const params = new URLSearchParams({ propertyId: input.propertyId });
    if (input.brokerId) params.set("brokerId", input.brokerId);
    if (input.from) params.set("from", input.from.toISOString());
    if (input.days) params.set("days", String(input.days));
    const res = await fetch(
      `${this.baseUrl}/tenants/${tenantId}/viewings/availability?${params.toString()}`,
    );
    if (!res.ok) throw new Error(`HttpViewingGateway getAvailability failed: ${res.status}`);
    return (await res.json()) as ViewingAvailabilitySlot[];
  }

  async book(tenantId: string, input: BookViewingInput): Promise<ViewingRecord> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/viewings`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`HttpViewingGateway book failed: ${res.status}`);
    return (await res.json()) as ViewingRecord;
  }

  async reschedule(
    tenantId: string,
    viewingId: string,
    scheduledAt: Date,
    endsAt?: Date,
  ): Promise<ViewingRecord> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/viewings/${viewingId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scheduledAt, endsAt }),
    });
    if (!res.ok) throw new Error(`HttpViewingGateway reschedule failed: ${res.status}`);
    return (await res.json()) as ViewingRecord;
  }

  async cancel(tenantId: string, viewingId: string, reason?: string): Promise<ViewingRecord> {
    const res = await fetch(
      `${this.baseUrl}/tenants/${tenantId}/viewings/${viewingId}/cancel`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      },
    );
    if (!res.ok) throw new Error(`HttpViewingGateway cancel failed: ${res.status}`);
    return (await res.json()) as ViewingRecord;
  }
}
