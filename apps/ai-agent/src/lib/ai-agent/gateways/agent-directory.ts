export type BrokerProfile = {
  id: string;
  tenantId: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  notificationEndpoint: string | null;
  workingHours: unknown;
  active: boolean;
};

export interface AgentDirectory {
  listActive(tenantId: string): Promise<BrokerProfile[]>;
  getById(tenantId: string, brokerId: string): Promise<BrokerProfile | null>;
  assignLead(tenantId: string, leadId: string, brokerId: string): Promise<void>;
}
