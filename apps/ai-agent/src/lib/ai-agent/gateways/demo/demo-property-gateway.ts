import type {
  PropertyDetails,
  PropertyGateway,
  PropertySearchFilters,
} from "../property-gateway";
import { getDemoStore, type DemoProperty } from "../../demo/store";

function mapProperty(row: DemoProperty): PropertyDetails {
  return {
    id: row.id,
    tenantId: row.tenantId,
    title: row.title,
    description: row.description,
    propertyType: row.propertyType,
    listingType: row.listingType,
    status: row.status,
    city: row.city,
    district: row.district,
    countryCode: row.countryCode,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqm: row.areaSqm,
    priceAmount: row.priceAmount,
    priceCurrency: row.priceCurrency,
    amenities: row.amenities,
    facts: row.facts,
  };
}

export class DemoPropertyGateway implements PropertyGateway {
  async getById(tenantId: string, propertyId: string): Promise<PropertyDetails | null> {
    const row = getDemoStore().properties.find(
      (p) => p.tenantId === tenantId && p.id === propertyId,
    );
    return row ? mapProperty(row) : null;
  }

  async search(tenantId: string, filters: PropertySearchFilters): Promise<PropertyDetails[]> {
    return getDemoStore()
      .properties.filter((p) => {
        if (p.tenantId !== tenantId || !p.active) return false;
        if (filters.city && (p.city ?? "").toLowerCase() !== filters.city.toLowerCase()) {
          return false;
        }
        if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
        if (filters.listingType && p.listingType !== filters.listingType) return false;
        const price = p.priceAmount != null ? Number(p.priceAmount) : null;
        if (filters.minPrice != null && (price == null || price < filters.minPrice)) return false;
        if (filters.maxPrice != null && (price == null || price > filters.maxPrice)) return false;
        if (filters.minBedrooms != null && (p.bedrooms ?? 0) < filters.minBedrooms) return false;
        return true;
      })
      .map(mapProperty);
  }

  async compare(tenantId: string, propertyIds: string[]): Promise<PropertyDetails[]> {
    const results: PropertyDetails[] = [];
    for (const id of propertyIds) {
      const item = await this.getById(tenantId, id);
      if (item) results.push(item);
    }
    return results;
  }
}
