import type { PropertyDetails } from "@/lib/ai-agent/gateways/property-gateway";

export type PresentationSlide =
  | {
      type: "cover";
      title: string;
      subtitle: string;
      location: string;
      eyebrow?: string;
      badge?: string;
      kicker?: string;
    }
  | {
      type: "metrics";
      title: string;
      items: Array<{ label: string; value: string; hint?: string }>;
    }
  | {
      type: "highlights";
      title: string;
      items: Array<{ title: string; detail: string }>;
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
      type: "gallery";
      title: string;
      caption: string;
      frames: Array<{ label: string; note: string }>;
    }
  | {
      type: "neighborhood";
      title: string;
      district: string;
      city: string;
      points: string[];
      body: string;
    }
  | {
      type: "floorplan";
      title: string;
      caption: string;
      rooms: Array<{ id: string; label: string; x: number; y: number; w: number; h: number }>;
    }
  | {
      type: "compare_matrix";
      title: string;
      columns: string[];
      rows: Array<{ label: string; values: string[] }>;
    }
  | {
      type: "cta";
      title: string;
      body: string;
      actions: string[];
      contactHint: string;
    }
  | {
      type: "narrative";
      title: string;
      body: string;
    }
  | {
      /** Spatial / 3D preview — facts + uploaded scene only, no invented measurements. */
      type: "spatial";
      title: string;
      caption: string;
      layoutHint: string;
      renderer: "placeholder-3d" | "scene-2d" | "scene-3d";
      rooms?: Array<{ id: string; label: string; x: number; y: number; w: number; h: number }>;
    };

export type DeckStyle = "executive" | "lifestyle" | "investor";

export type PresentationSpec = {
  id?: string;
  version: 2;
  title: string;
  propertyId: string;
  tenantId: string;
  currency: string;
  priceLabel: string;
  deckStyle: DeckStyle;
  themeId?: string;
  slides: PresentationSlide[];
  generatedAt: string;
  source: "property_gateway";
};

export type BuildPresentationOptions = {
  deckStyle?: DeckStyle;
  themeId?: string;
};

function money(amount: string | null, currency: string): string {
  if (!amount) return "Price on request";
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} ${amount}`;
  return `${currency} ${n.toLocaleString("en-AE")}`;
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "object" && value) return Object.keys(value as object);
  return [];
}

function pricePerSqm(property: PropertyDetails): string | null {
  const price = property.priceAmount != null ? Number(property.priceAmount) : NaN;
  const area = property.areaSqm != null ? Number(property.areaSqm) : NaN;
  if (!Number.isFinite(price) || !Number.isFinite(area) || area <= 0) return null;
  return `${property.priceCurrency} ${Math.round(price / area).toLocaleString("en-AE")}/sqm`;
}

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function deriveHighlights(property: PropertyDetails, amenities: string[]): Array<{ title: string; detail: string }> {
  const facts = (property.facts ?? {}) as Record<string, unknown>;
  const items: Array<{ title: string; detail: string }> = [];

  if (facts.view) {
    items.push({
      title: "View profile",
      detail: String(facts.view).replace(/_/g, " "),
    });
  }
  if (facts.parkingSpaces != null) {
    items.push({
      title: "Parking",
      detail: `${facts.parkingSpaces} space${Number(facts.parkingSpaces) === 1 ? "" : "s"} on record`,
    });
  }
  if (facts.furnished) {
    items.push({
      title: "Furnishing",
      detail: `${String(facts.furnished).replace(/_/g, " ")} finish`,
    });
  }
  if (facts.yearBuilt) {
    items.push({
      title: "Year built",
      detail: String(facts.yearBuilt),
    });
  }
  for (const amenity of amenities.slice(0, 4)) {
    if (items.length >= 6) break;
    items.push({
      title: humanize(amenity),
      detail: "Listed amenity from inventory",
    });
  }
  if (property.bedrooms != null) {
    items.unshift({
      title: `${property.bedrooms} bedroom layout`,
      detail: `${property.bathrooms ?? "—"} bath · ${property.areaSqm ?? "—"} sqm`,
    });
  }
  return items.slice(0, 6);
}

function deriveNeighborhoodPoints(property: PropertyDetails): string[] {
  const points: string[] = [];
  if (property.district) points.push(`Community: ${property.district}`);
  if (property.city) points.push(`City: ${property.city}`);
  if (property.countryCode) points.push(`Market: ${property.countryCode}`);
  if (property.listingType) points.push(`Listing type: ${property.listingType}`);
  if (property.status) points.push(`Status: ${property.status}`);
  const desc = (property.description ?? "").toLowerCase();
  if (desc.includes("metro")) points.push("Description notes metro access");
  if (desc.includes("marina") || desc.includes("sea")) points.push("Description notes water / marina context");
  if (desc.includes("rental") || desc.includes("investor")) points.push("Description notes investor / rental angle");
  return points.slice(0, 6);
}

function heuristicRooms(property: PropertyDetails): Array<{
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}> {
  const beds = property.bedrooms ?? 1;
  const rooms = [
    { id: "living", label: "Living", x: 8, y: 18, w: 42, h: 38 },
    { id: "kitchen", label: "Kitchen", x: 54, y: 18, w: 38, h: 22 },
  ];
  for (let i = 0; i < Math.min(beds, 3); i += 1) {
    rooms.push({
      id: `bed-${i + 1}`,
      label: `Bed ${i + 1}`,
      x: 8 + i * 30,
      y: 62,
      w: 26,
      h: 28,
    });
  }
  if ((property.bathrooms ?? 0) > 0) {
    rooms.push({ id: "bath", label: "Bath", x: 72, y: 48, w: 20, h: 18 });
  }
  return rooms;
}

function galleryFrames(property: PropertyDetails): Array<{ label: string; note: string }> {
  const maybeMedia = (property as PropertyDetails & { media?: unknown }).media;
  const media = Array.isArray(maybeMedia) ? (maybeMedia as Array<Record<string, unknown>>) : [];
  if (media.length > 0) {
    return media.slice(0, 4).map((m, idx) => ({
      label: String(m.type ?? `Frame ${idx + 1}`),
      note: String(m.url ?? "Inventory media reference"),
    }));
  }
  return [
    { label: "Exterior", note: `${property.district ?? "Community"} frontage` },
    { label: "Living", note: `${property.bedrooms ?? "—"} BR reception zone` },
    { label: "Kitchen", note: "Kitchen / dining (attach photography)" },
    { label: "Outlook", note: String((property.facts as Record<string, unknown> | null)?.view ?? property.city ?? "City context") },
  ];
}

/** Build an advanced PresentationSpec from PropertyGateway facts only — no invented claims. */
export function buildPresentationSpec(
  property: PropertyDetails,
  options: BuildPresentationOptions = {},
): PresentationSpec {
  const deckStyle: DeckStyle = options.deckStyle ?? "executive";
  const amenities = asStringList(property.amenities);
  const facts = (property.facts ?? {}) as Record<string, unknown>;
  const location = [property.district, property.city, property.countryCode].filter(Boolean).join(", ");
  const pps = pricePerSqm(property);
  const priceLabel = money(property.priceAmount, property.priceCurrency);

  const factRows: Array<{ label: string; value: string }> = [
    { label: "Type", value: property.propertyType },
    { label: "Listing", value: property.listingType },
    { label: "Status", value: property.status },
    { label: "Bedrooms", value: property.bedrooms != null ? String(property.bedrooms) : "—" },
    { label: "Bathrooms", value: property.bathrooms != null ? String(property.bathrooms) : "—" },
    { label: "Area", value: property.areaSqm ? `${property.areaSqm} sqm` : "—" },
    { label: "Price", value: priceLabel },
  ];
  if (pps) factRows.push({ label: "Price / sqm", value: pps });
  for (const [k, v] of Object.entries(facts)) {
    if (v == null) continue;
    factRows.push({ label: humanize(k), value: String(v) });
  }

  const metrics: PresentationSlide = {
    type: "metrics",
    title: "At a glance",
    items: [
      {
        label: "Bedrooms",
        value: property.bedrooms != null ? String(property.bedrooms) : "—",
        hint: "From listing",
      },
      {
        label: "Bathrooms",
        value: property.bathrooms != null ? String(property.bathrooms) : "—",
      },
      {
        label: "Area",
        value: property.areaSqm ? `${property.areaSqm}` : "—",
        hint: "sqm",
      },
      {
        label: "Ask",
        value: property.priceAmount
          ? `${(Number(property.priceAmount) / 1_000_000).toFixed(2)}M`
          : "POR",
        hint: property.priceCurrency,
      },
      ...(pps
        ? [{ label: "AED/sqm", value: pps.replace(`${property.priceCurrency} `, "").replace("/sqm", ""), hint: "Derived" }]
        : []),
    ].slice(0, 5),
  };

  const cover: PresentationSlide = {
    type: "cover",
    title: property.title,
    subtitle: priceLabel,
    location,
    eyebrow: "PropPilot · Listing dossier",
    badge: deckStyle === "investor" ? "Investor brief" : deckStyle === "lifestyle" ? "Lifestyle edit" : "Executive dossier",
    kicker: property.propertyType,
  };

  const highlights: PresentationSlide = {
    type: "highlights",
    title: deckStyle === "lifestyle" ? "Why buyers will love it" : "Listing highlights",
    items: deriveHighlights(property, amenities),
  };

  const factsSlide: PresentationSlide = {
    type: "facts",
    title: "Verified listing facts",
    rows: factRows,
  };

  const amenitiesSlide: PresentationSlide | null =
    amenities.length > 0
      ? {
          type: "amenities",
          title: "Amenities & building services",
          items: amenities,
        }
      : null;

  const neighborhood: PresentationSlide = {
    type: "neighborhood",
    title: "Location context",
    district: property.district ?? "—",
    city: property.city ?? "—",
    points: deriveNeighborhoodPoints(property),
    body:
      property.description?.slice(0, 280) ||
      `${property.title} is positioned in ${location || "the market"} with facts sourced from PropertyGateway.`,
  };

  const floorplan: PresentationSlide = {
    type: "floorplan",
    title: "Indicative layout zones",
    caption: `${property.propertyType} · ${property.bedrooms ?? "—"} BR · ${property.areaSqm ?? "—"} sqm — schematic from bedroom/bath counts, not surveyed measurements`,
    rooms: heuristicRooms(property),
  };

  const gallery: PresentationSlide = {
    type: "gallery",
    title: "Media board",
    caption: "Frames map to inventory media URLs when present; otherwise placeholders remind brokers to attach photography.",
    frames: galleryFrames(property),
  };

  const narrative: PresentationSlide | null = property.description
    ? {
        type: "narrative",
        title: deckStyle === "investor" ? "Investment narrative (from listing copy)" : "Agent narrative",
        body: property.description,
      }
    : null;

  const spatial: PresentationSlide = {
    type: "spatial",
    title: "Spatial preview",
    caption: `${property.propertyType} · ${property.bedrooms ?? "—"} BR · ${property.areaSqm ?? "—"} sqm`,
    layoutHint: property.propertyType,
    renderer: "placeholder-3d",
    rooms: heuristicRooms(property),
  };

  const cta: PresentationSlide = {
    type: "cta",
    title: "Next steps with PropPilot",
    body: "Share this deck, book a viewing, or hand the lead to a broker — every figure above is gateway-sourced.",
    actions: ["Book a viewing", "Request updated photography", "Compare against shortlist", "Hand off to broker"],
    contactHint: "Generated in Presentation Studio · export as PowerPoint anytime",
  };

  const slides: PresentationSlide[] = [cover, metrics, highlights];

  if (deckStyle === "investor") {
    slides.push(factsSlide);
    if (amenitiesSlide) slides.push(amenitiesSlide);
    slides.push(neighborhood);
    if (narrative) slides.push(narrative);
    slides.push(gallery, floorplan, spatial, cta);
  } else if (deckStyle === "lifestyle") {
    slides.push(gallery, neighborhood);
    if (amenitiesSlide) slides.push(amenitiesSlide);
    slides.push(floorplan, factsSlide);
    if (narrative) slides.push(narrative);
    slides.push(spatial, cta);
  } else {
    // executive
    slides.push(factsSlide);
    if (amenitiesSlide) slides.push(amenitiesSlide);
    slides.push(neighborhood, gallery, floorplan);
    if (narrative) slides.push(narrative);
    slides.push(spatial, cta);
  }

  return {
    version: 2,
    title: property.title,
    propertyId: property.id,
    tenantId: property.tenantId,
    currency: property.priceCurrency,
    priceLabel,
    deckStyle,
    themeId: options.themeId,
    slides,
    generatedAt: new Date().toISOString(),
    source: "property_gateway",
  };
}
