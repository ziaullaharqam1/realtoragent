export type PropPilotRole = "admin" | "broker" | "viewer";

export type SessionPrincipal = {
  role: PropPilotRole;
  userId: string;
  displayName: string;
};
