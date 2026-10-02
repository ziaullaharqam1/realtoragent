import { getDb } from "@/lib/db/client";
import type { AgentDirectory } from "./agent-directory";
import type { LeadGateway } from "./lead-gateway";
import type { PropertyGateway } from "./property-gateway";
import type { ViewingGateway } from "./viewing-gateway";
import { HttpAgentDirectory } from "./http/http-agent-directory";
import { HttpLeadGateway } from "./http/http-lead-gateway";
import { HttpPropertyGateway } from "./http/http-property-gateway";
import { HttpViewingGateway } from "./http/http-viewing-gateway";
import { LocalAgentDirectory } from "./local/local-agent-directory";
import { LocalLeadGateway } from "./local/local-lead-gateway";
import { LocalPropertyGateway } from "./local/local-property-gateway";
import { LocalViewingGateway } from "./local/local-viewing-gateway";

export type GatewayBundle = {
  leads: LeadGateway;
  properties: PropertyGateway;
  viewings: ViewingGateway;
  agents: AgentDirectory;
  mode: "local" | "http";
};

export function createGateways(): GatewayBundle {
  const mode = (process.env.GATEWAY_MODE ?? "local").toLowerCase();
  if (mode === "http") {
    const baseUrl = process.env.HOST_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("GATEWAY_MODE=http requires HOST_API_BASE_URL");
    }
    return {
      mode: "http",
      leads: new HttpLeadGateway(baseUrl),
      properties: new HttpPropertyGateway(baseUrl),
      viewings: new HttpViewingGateway(baseUrl),
      agents: new HttpAgentDirectory(baseUrl),
    };
  }
  const db = getDb();
  return {
    mode: "local",
    leads: new LocalLeadGateway(db),
    properties: new LocalPropertyGateway(db),
    viewings: new LocalViewingGateway(db),
    agents: new LocalAgentDirectory(db),
  };
}
