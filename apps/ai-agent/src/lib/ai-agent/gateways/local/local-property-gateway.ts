import { and, eq, gte, lte, sql } from "drizzle-orm";
import type { AppDb } from "@/lib/db/client";
import { properties } from "@/lib/db/schema";
import type {
  PropertyDetails,
  PropertyGateway,
  PropertySearchFilters,
} from "../property-gateway";

function mapProperty(row: typeof properties.$inferSelect): PropertyDetails {
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
    amenities: row.amenitiesJson,
    facts: row.factsJson,
  };
}

export class LocalPropertyGateway implements PropertyGateway {
  constructor(private readonly db: AppDb) {}

  async getById(tenantId: string, propertyId: string): Promise<PropertyDetails | null> {
    const rows = await this.db
      .select()
      .from(properties)
      .where(and(eq(properties.tenantId, tenantId), eq(properties.id, propertyId)))
      .limit(1);
    return rows[0] ? mapProperty(rows[0]) : null;
  }

  async search(tenantId: string, filters: PropertySearchFilters): Promise<PropertyDetails[]> {
    const clauses = [eq(properties.tenantId, tenantId), eq(properties.active, true)];
    if (filters.city) {
      clauses.push(sql`lower(${properties.city}) = lower(${filters.city})`);
    }
    if (filters.propertyType) {
      clauses.push(eq(properties.propertyType, filters.propertyType));
    }
    if (filters.listingType) {
      clauses.push(eq(properties.listingType, filters.listingType));
    }
    if (filters.minPrice != null) {
      clauses.push(gte(properties.priceAmount, String(filters.minPrice)));
    }
    if (filters.maxPrice != null) {
      clauses.push(lte(properties.priceAmount, String(filters.maxPrice)));
    }
    if (filters.minBedrooms != null) {
      clauses.push(gte(properties.bedrooms, filters.minBedrooms));
    }
    const rows = await this.db
      .select()
      .from(properties)
      .where(and(...clauses));
    return rows.map(mapProperty);
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
