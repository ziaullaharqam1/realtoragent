import PptxGenJS from "pptxgenjs";
import type { PresentationSlide } from "./spec";
import { getTheme } from "./studio";

type AnySpec = {
  title?: string;
  themeId?: string;
  slides?: PresentationSlide[];
  priceLabel?: string;
  source?: string;
};

function hex(color: string): string {
  return color.replace("#", "");
}

/** Build a real PowerPoint (.pptx) buffer from a PropPilot presentation spec. */
export async function buildPptxBuffer(spec: AnySpec): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = "PropPilot";
  pptx.title = spec.title ?? "PropPilot presentation";
  pptx.subject = "Fact-based property presentation";
  const theme = getTheme(spec.themeId);
  const slides = Array.isArray(spec.slides) ? spec.slides : [];

  if (slides.length === 0) {
    const s = pptx.addSlide();
    s.addText(spec.title ?? "PropPilot", {
      x: 0.5,
      y: 2.2,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: hex(theme.ink),
    });
  }

  for (const slide of slides) {
    const s = pptx.addSlide();
    s.background = { color: hex(theme.surface) };

    if (slide.type === "cover") {
      s.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 0.25,
        h: 5.625,
        fill: { color: hex(theme.primary) },
      });
      s.addText(slide.title, {
        x: 0.7,
        y: 1.6,
        w: 8.5,
        h: 1.2,
        fontSize: 30,
        bold: true,
        color: hex(theme.ink),
        fontFace: "Arial",
      });
      s.addText(slide.subtitle, {
        x: 0.7,
        y: 2.9,
        w: 8.5,
        h: 0.5,
        fontSize: 18,
        color: hex(theme.primary),
      });
      s.addText(slide.location, {
        x: 0.7,
        y: 3.5,
        w: 8.5,
        h: 0.4,
        fontSize: 14,
        color: "667085",
      });
      continue;
    }

    if (slide.type === "facts") {
      s.addText(slide.title, {
        x: 0.5,
        y: 0.35,
        w: 9,
        h: 0.5,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
      });
      const tableRows = [
        [
          {
            text: "Field",
            options: { bold: true, color: "FFFFFF", fill: { color: hex(theme.primary) } },
          },
          {
            text: "Value",
            options: { bold: true, color: "FFFFFF", fill: { color: hex(theme.primary) } },
          },
        ],
        ...slide.rows.map((r) => [
          { text: r.label, options: { color: hex(theme.ink) } },
          { text: r.value, options: { color: hex(theme.ink) } },
        ]),
      ];
      s.addTable(tableRows, {
        x: 0.5,
        y: 1.1,
        w: 9,
        colW: [3.5, 5.5],
        border: { type: "solid", pt: 0.5, color: "D0D5DD" },
        fontFace: "Arial",
        fontSize: 12,
        align: "left",
        valign: "middle",
      });
      continue;
    }

    if (slide.type === "amenities") {
      s.addText(slide.title, {
        x: 0.5,
        y: 0.4,
        w: 9,
        h: 0.5,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
      });
      s.addText(slide.items.map((i) => `• ${i}`).join("\n"), {
        x: 0.7,
        y: 1.2,
        w: 8.5,
        h: 3.8,
        fontSize: 16,
        color: hex(theme.ink),
        valign: "top",
      });
      continue;
    }

    if (slide.type === "spatial") {
      s.addText(slide.title, {
        x: 0.5,
        y: 0.35,
        w: 9,
        h: 0.45,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
      });
      s.addShape(pptx.ShapeType.roundRect, {
        x: 1.5,
        y: 1.2,
        w: 7,
        h: 3.2,
        fill: { color: "E8F3F2" },
        line: { color: hex(theme.primary), pt: 1.5 },
      });
      s.addText(`${slide.caption}\n\nLayout: ${slide.layoutHint}\nRenderer: ${slide.renderer}`, {
        x: 1.8,
        y: 2.0,
        w: 6.4,
        h: 1.8,
        fontSize: 14,
        color: hex(theme.ink),
        align: "center",
      });
      continue;
    }

    s.addText(slide.title, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.5,
      fontSize: 22,
      bold: true,
      color: hex(theme.ink),
    });
    s.addText(slide.body, {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 3.8,
      fontSize: 15,
      color: hex(theme.ink),
      valign: "top",
    });
  }

  const footer = pptx.addSlide();
  footer.background = { color: hex(theme.surface) };
  footer.addText("PropPilot", {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: hex(theme.primary),
  });
  footer.addText("All listing facts sourced from PropertyGateway — no invented claims.", {
    x: 0.5,
    y: 2.6,
    w: 9,
    h: 0.5,
    fontSize: 13,
    color: "667085",
  });

  const out = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return Buffer.isBuffer(out) ? out : Buffer.from(out as ArrayBuffer);
}
