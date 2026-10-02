import { NextResponse } from "next/server";
import { getDemoStore } from "@/lib/ai-agent/demo/store";
import { exportPresentation, type ExportFormat } from "@/lib/ai-agent/presentations/export";
import { buildPptxBuffer } from "@/lib/ai-agent/presentations/pptx";
import { requirePermission } from "@/lib/ai-agent/auth/rbac";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = requirePermission(request.headers, "export:presentation");
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const presentation = getDemoStore().presentations.find((p) => p.id === id);
  if (!presentation) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") ?? "pptx") as ExportFormat | "pptx";
  const slug = (presentation.title || "presentation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 48);

  if (format === "pptx") {
    const buffer = await buildPptxBuffer(presentation.spec);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${slug || "presentation"}.pptx"`,
      },
    });
  }

  if (!["md", "json", "pptx-json"].includes(format)) {
    return NextResponse.json({ error: "format must be pptx|md|json|pptx-json" }, { status: 400 });
  }

  const exported = exportPresentation(presentation.spec, format as ExportFormat);
  return new NextResponse(exported.body, {
    status: 200,
    headers: {
      "Content-Type": exported.contentType,
      "Content-Disposition": `attachment; filename="${exported.filename}"`,
    },
  });
}
