import { NextResponse } from "next/server";
import { hybridSearch } from "@/lib/ai-agent/search/hybrid";
import { defaultTenantId } from "@/lib/ai-agent/demo/mode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") ?? defaultTenantId();
  const q = searchParams.get("q") ?? undefined;
  const city = searchParams.get("city") ?? undefined;
  const propertyType = searchParams.get("propertyType") ?? undefined;
  const listingType = searchParams.get("listingType") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minBedrooms = searchParams.get("minBedrooms");

  const hits = await hybridSearch(tenantId, {
    query: q,
    city,
    propertyType: propertyType ?? undefined,
    listingType: listingType ?? undefined,
    minPrice: minPrice != null ? Number(minPrice) : undefined,
    maxPrice: maxPrice != null ? Number(maxPrice) : undefined,
    minBedrooms: minBedrooms != null ? Number(minBedrooms) : undefined,
    limit: 20,
  });

  return NextResponse.json({ count: hits.length, results: hits });
}
