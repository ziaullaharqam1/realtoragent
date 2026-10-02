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

export interface ViewingGateway {
  getById(tenantId: string, viewingId: string): Promise<ViewingRecord | null>;
  listForLead(tenantId: string, leadId: string): Promise<ViewingRecord[]>;
  book(tenantId: string, input: BookViewingInput): Promise<ViewingRecord>;
  reschedule(
    tenantId: string,
    viewingId: string,
    scheduledAt: Date,
    endsAt?: Date,
  ): Promise<ViewingRecord>;
  cancel(tenantId: string, viewingId: string, reason?: string): Promise<ViewingRecord>;
}
