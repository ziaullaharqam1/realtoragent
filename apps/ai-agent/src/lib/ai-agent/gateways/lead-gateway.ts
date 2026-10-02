export type LeadProfile = {
  id: string;
  tenantId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  state: string;
  score: number;
  scoreBreakdown: Record<string, unknown> | null;
  consentMarketing: boolean;
  consentAi: boolean;
  preferredLocale: string;
  assignedBrokerId: string | null;
};

export type LeadUpdate = Partial<
  Pick<
    LeadProfile,
    | "fullName"
    | "email"
    | "phone"
    | "state"
    | "score"
    | "scoreBreakdown"
    | "consentMarketing"
    | "consentAi"
    | "preferredLocale"
    | "assignedBrokerId"
  >
>;

export interface LeadGateway {
  getById(tenantId: string, leadId: string): Promise<LeadProfile | null>;
  updateProfile(tenantId: string, leadId: string, patch: LeadUpdate): Promise<LeadProfile>;
}
