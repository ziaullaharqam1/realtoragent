import type {
  PropertyDetails,
  PropertyGateway,
  PropertySearchFilters,
} from "../property-gateway";

export class HttpPropertyGateway implements PropertyGateway {
  constructor(private readonly baseUrl: string) {}

  async getById(tenantId: string, propertyId: string): Promise<PropertyDetails | null> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/properties/${propertyId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HttpPropertyGateway getById failed: ${res.status}`);
    return (await res.json()) as PropertyDetails;
  }

  async search(tenantId: string, filters: PropertySearchFilters): Promise<PropertyDetails[]> {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v != null) qs.set(k, String(v));
    }
    const res = await fetch(
      `${this.baseUrl}/tenants/${tenantId}/properties?${qs.toString()}`,
    );
    if (!res.ok) throw new Error(`HttpPropertyGateway search failed: ${res.status}`);
    return (await res.json()) as PropertyDetails[];
  }

  async compare(tenantId: string, propertyIds: string[]): Promise<PropertyDetails[]> {
    const res = await fetch(`${this.baseUrl}/tenants/${tenantId}/properties/compare`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ propertyIds }),
    });
    if (!res.ok) throw new Error(`HttpPropertyGateway compare failed: ${res.status}`);
    return (await res.json()) as PropertyDetails[];
  }
}
