import type { PropertyDetails } from "@/lib/ai-agent/gateways/property-gateway";

export type PresentationSlide =
  | {
      type: "cover";
      title: string;
      subtitle: string;
      location: string;
    }
  | {
      type: "facts";
      title: string;
      rows: Array<{ label: string; value: string }>;
    }
  | {
      type: "amenities";
      title: string;
      items: string[];
    }
  | {
      type: "narrative";
      title: string;
      body: string;
    };

export type PresentationSpec = {
  id?: string;
  version: 1;
  title: string;
  propertyId: string;
  tenantId: string;
  currency: string;
  priceLabel: string;
  slides: PresentationSlide[];
  generatedAt: string;
  source: "property_gateway";
};

function money(amount: string | null, currency: string): string {
  if (!amount) return "Price on request";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString("en-AE")}`;
}

/** Build PresentationSpec from PropertyGateway facts only — no invented claims. */
export function buildPresentationSpec(property: PropertyDetails): PresentationSpec {
  const facts = (property.facts ?? {}) as Record<string, unknown>;
  const amenities = Array.isArray(property.amenities)
    ? (property.amenities as string[])
    : typeof property.amenities === "object" && property.amenities
      ? Object.keys(property.amenities as object)
      : [];

  const factRows: Array<{ label: string; value: string }> = [
    { label: "Type", value: property.propertyType },
    { label: "Listing", value: property.listingType },
    { label: "Status", value: property.status },
    {
      label: "Bedrooms",
      value: property.bedrooms != null ? String(property.bedrooms) : "—",
    },
    {
      label: "Bathrooms",
      value: property.bathrooms != null ? String(property.bathrooms) : "—",
    },
    {
      label: "Area",
      value: property.areaSqm ? `${property.areaSqm} sqm` : "—",
    },
  ];
  for (const [k, v] of Object.entries(facts)) {
    if (v == null) continue;
    factRows.push({
      label: k.replace(/_/g, " "),
      value: String(v),
    });
  }

  const location = [property.district, property.city, property.countryCode]
    .filter(Boolean)
    .join(", ");

  const slides: PresentationSlide[] = [
    {
      type: "cover",
      title: property.title,
      subtitle: money(property.priceAmount, property.priceCurrency),
      location,
    },
    {
      type: "facts",
      title: "Listing facts",
      rows: factRows,
    },
  ];

  if (amenities.length > 0) {
    slides.push({
      type: "amenities",
      title: "Amenities",
      items: amenities,
    });
  }

  if (property.description) {
    slides.push({
      type: "narrative",
      title: "Description",
      body: property.description,
    });
  }

  return {
    version: 1,
    title: property.title,
    propertyId: property.id,
    tenantId: property.tenantId,
    currency: property.priceCurrency,
    priceLabel: money(property.priceAmount, property.priceCurrency),
    slides,
    generatedAt: new Date().toISOString(),
    source: "property_gateway",
  };
}
