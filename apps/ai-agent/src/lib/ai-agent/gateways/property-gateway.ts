export type PropertyDetails = {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  propertyType: string;
  listingType: string;
  status: string;
  city: string | null;
  district: string | null;
  countryCode: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: string | null;
  priceAmount: string | null;
  priceCurrency: string;
  amenities: unknown;
  facts: unknown;
};

export type PropertySearchFilters = {
  city?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
};

export interface PropertyGateway {
  getById(tenantId: string, propertyId: string): Promise<PropertyDetails | null>;
  search(tenantId: string, filters: PropertySearchFilters): Promise<PropertyDetails[]>;
  compare(tenantId: string, propertyIds: string[]): Promise<PropertyDetails[]>;
}
