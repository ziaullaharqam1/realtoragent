export type ViewingRecord = {
  id: string;
  tenantId: string;
  leadId: string;
  propertyId: string;
  brokerId: string | null;
  status: string;
  scheduledAt: Date | null;
  endsAt: Date | null;
  notes: string | null;
};

export type BookViewingInput = {
  leadId: string;
  propertyId: string;
  brokerId?: string;
  scheduledAt: Date;
  endsAt?: Date;
  notes?: string;
};

export type ViewingAvailabilitySlot = {
  start: string;
  end: string;
  brokerId: string | null;
  propertyId: string;
  timezone: string;
  available: boolean;
};

export type AvailabilityInput = {
  propertyId: string;
  brokerId?: string;
  from?: Date;
  days?: number;
};

export interface ViewingGateway {
  getById(tenantId: string, viewingId: string): Promise<ViewingRecord | null>;
  listForLead(tenantId: string, leadId: string): Promise<ViewingRecord[]>;
  getAvailability(tenantId: string, input: AvailabilityInput): Promise<ViewingAvailabilitySlot[]>;
  book(tenantId: string, input: BookViewingInput): Promise<ViewingRecord>;
  reschedule(
    tenantId: string,
    viewingId: string,
    scheduledAt: Date,
    endsAt?: Date,
  ): Promise<ViewingRecord>;
  cancel(tenantId: string, viewingId: string, reason?: string): Promise<ViewingRecord>;
}
