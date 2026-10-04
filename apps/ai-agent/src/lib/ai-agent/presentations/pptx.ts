import PptxGenJS from "pptxgenjs";
import type { PresentationSlide } from "./spec";
import { getTheme, type PresentationTheme } from "./studio";

type AnySpec = {
  title?: string;
  themeId?: string;
  slides?: PresentationSlide[];
  priceLabel?: string;
  source?: string;
  deckStyle?: string;
};

function hex(color: string): string {
  return color.replace("#", "");
}

function addBrandBar(pptx: PptxGenJS, s: PptxGenJS.Slide, theme: PresentationTheme) {
  s.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.12,
    fill: { color: hex(theme.primary) },
  });
}

function addFooter(pptx: PptxGenJS, s: PptxGenJS.Slide, theme: PresentationTheme, page: string) {
  s.addText("PropPilot", {
    x: 0.45,
    y: 5.25,
    w: 3,
    h: 0.25,
    fontSize: 10,
    color: hex(theme.primary),
    fontFace: theme.fontBody,
    bold: true,
  });
  s.addText(page, {
    x: 7.5,
    y: 5.25,
    w: 2,
    h: 0.25,
    fontSize: 10,
    color: hex(theme.muted),
    align: "right",
    fontFace: theme.fontBody,
  });
}

/** Build a real PowerPoint (.pptx) buffer from an advanced PropPilot presentation spec. */
export async function buildPptxBuffer(spec: AnySpec): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.author = "PropPilot";
  pptx.title = spec.title ?? "PropPilot presentation";
  pptx.subject = "Advanced fact-based property presentation";
  pptx.layout = "LAYOUT_WIDE";
  const theme = getTheme(spec.themeId);
  const slides = Array.isArray(spec.slides) ? spec.slides : [];
  const dark = theme.id === "night";

  if (slides.length === 0) {
    const s = pptx.addSlide();
    s.background = { color: hex(theme.surface) };
    s.addText(spec.title ?? "PropPilot", {
      x: 0.5,
      y: 2.2,
      w: 9,
      h: 1,
      fontSize: 32,
      bold: true,
      color: hex(theme.ink),
      fontFace: theme.fontDisplay,
    });
  }

  slides.forEach((slide, index) => {
    const s = pptx.addSlide();
    s.background = { color: hex(theme.surface) };
    const page = `${index + 1} / ${slides.length}`;

    if (slide.type === "cover") {
      s.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 3.4,
        h: 5.625,
        fill: { color: hex(theme.primary) },
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 3.4,
        y: 0,
        w: 6.6,
        h: 5.625,
        fill: { color: hex(dark ? theme.accentSoft : theme.surface) },
      });
      s.addText(slide.eyebrow ?? "PropPilot", {
        x: 0.35,
        y: 0.55,
        w: 2.8,
        h: 0.35,
        fontSize: 12,
        color: "FFFFFF",
        fontFace: theme.fontBody,
      });
      s.addText(slide.badge ?? "Listing dossier", {
        x: 0.35,
        y: 1.0,
        w: 2.8,
        h: 0.35,
        fontSize: 11,
        color: hex(theme.secondary),
        fontFace: theme.fontBody,
        bold: true,
      });
      s.addText(slide.title, {
        x: 3.8,
        y: 1.5,
        w: 5.7,
        h: 1.6,
        fontSize: 28,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      s.addText(slide.subtitle, {
        x: 3.8,
        y: 3.3,
        w: 5.7,
        h: 0.45,
        fontSize: 18,
        color: hex(theme.primary),
        fontFace: theme.fontBody,
        bold: true,
      });
      s.addText(slide.location, {
        x: 3.8,
        y: 3.85,
        w: 5.7,
        h: 0.35,
        fontSize: 13,
        color: hex(theme.muted),
        fontFace: theme.fontBody,
      });
      if (slide.kicker) {
        s.addText(slide.kicker.toUpperCase(), {
          x: 3.8,
          y: 4.4,
          w: 5.7,
          h: 0.3,
          fontSize: 11,
          color: hex(theme.muted),
          fontFace: theme.fontBody,
        });
      }
      return;
    }

    addBrandBar(pptx, s, theme);

    if (slide.type === "metrics") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.35,
        w: 9,
        h: 0.45,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      const count = Math.min(slide.items.length, 5);
      const cardW = 1.7;
      const gap = 0.18;
      const startX = 0.45;
      slide.items.slice(0, count).forEach((item, i) => {
        const x = startX + i * (cardW + gap);
        s.addShape(pptx.ShapeType.roundRect, {
          x,
          y: 1.2,
          w: cardW,
          h: 2.6,
          fill: { color: hex(theme.accentSoft) },
          rectRadius: 0.1,
        });
        s.addText(item.label.toUpperCase(), {
          x: x + 0.12,
          y: 1.45,
          w: cardW - 0.24,
          h: 0.35,
          fontSize: 10,
          color: hex(theme.muted),
          fontFace: theme.fontBody,
        });
        s.addText(item.value, {
          x: x + 0.12,
          y: 2.1,
          w: cardW - 0.24,
          h: 0.8,
          fontSize: 22,
          bold: true,
          color: hex(theme.ink),
          fontFace: theme.fontDisplay,
        });
        if (item.hint) {
          s.addText(item.hint, {
            x: x + 0.12,
            y: 3.1,
            w: cardW - 0.24,
            h: 0.35,
            fontSize: 11,
            color: hex(theme.primary),
            fontFace: theme.fontBody,
          });
        }
      });
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "highlights") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.35,
        w: 9,
        h: 0.45,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      slide.items.slice(0, 6).forEach((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 0.45 + col * 4.7;
        const y = 1.05 + row * 1.2;
        s.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w: 4.4,
          h: 1.05,
          fill: { color: hex(theme.accentSoft) },
          rectRadius: 0.08,
        });
        s.addShape(pptx.ShapeType.rect, {
          x,
          y,
          w: 0.12,
          h: 1.05,
          fill: { color: hex(theme.primary) },
        });
        s.addText(item.title, {
          x: x + 0.3,
          y: y + 0.18,
          w: 3.9,
          h: 0.35,
          fontSize: 14,
          bold: true,
          color: hex(theme.ink),
          fontFace: theme.fontBody,
        });
        s.addText(item.detail, {
          x: x + 0.3,
          y: y + 0.52,
          w: 3.9,
          h: 0.35,
          fontSize: 12,
          color: hex(theme.muted),
          fontFace: theme.fontBody,
        });
      });
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "facts") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.3,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
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
        ...slide.rows.slice(0, 12).map((r) => [
          { text: r.label, options: { color: hex(theme.ink) } },
          { text: r.value, options: { color: hex(theme.ink) } },
        ]),
      ];
      s.addTable(tableRows, {
        x: 0.45,
        y: 0.9,
        w: 9.1,
        colW: [3.4, 5.7],
        border: { type: "solid", pt: 0.5, color: "D0D5DD" },
        fontFace: theme.fontBody,
        fontSize: 12,
        align: "left",
        valign: "middle",
      });
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "amenities") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.35,
        w: 9,
        h: 0.45,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      slide.items.slice(0, 12).forEach((item, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 0.45 + col * 3.1;
        const y = 1.1 + row * 0.85;
        s.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w: 2.9,
          h: 0.7,
          fill: { color: hex(theme.accentSoft) },
          rectRadius: 0.08,
        });
        s.addText(item, {
          x: x + 0.15,
          y: y + 0.18,
          w: 2.6,
          h: 0.35,
          fontSize: 13,
          color: hex(theme.ink),
          fontFace: theme.fontBody,
          bold: true,
        });
      });
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "gallery") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.3,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      s.addText(slide.caption, {
        x: 0.45,
        y: 0.75,
        w: 9,
        h: 0.35,
        fontSize: 11,
        color: hex(theme.muted),
        fontFace: theme.fontBody,
      });
      slide.frames.slice(0, 4).forEach((frame, i) => {
        const x = 0.45 + (i % 4) * 2.35;
        const y = 1.3;
        s.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w: 2.2,
          h: 3.2,
          fill: { color: hex(theme.accentSoft) },
          rectRadius: 0.1,
        });
        s.addShape(pptx.ShapeType.rect, {
          x: x + 0.15,
          y: y + 0.2,
          w: 1.9,
          h: 1.7,
          fill: { color: hex(theme.primary) },
        });
        s.addText(frame.label, {
          x: x + 0.15,
          y: y + 2.1,
          w: 1.9,
          h: 0.35,
          fontSize: 13,
          bold: true,
          color: hex(theme.ink),
          fontFace: theme.fontBody,
        });
        s.addText(frame.note, {
          x: x + 0.15,
          y: y + 2.5,
          w: 1.9,
          h: 0.55,
          fontSize: 10,
          color: hex(theme.muted),
          fontFace: theme.fontBody,
        });
      });
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "neighborhood") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.3,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.45,
        y: 0.95,
        w: 4.3,
        h: 3.7,
        fill: { color: hex(theme.primary) },
        rectRadius: 0.1,
      });
      s.addText(slide.district, {
        x: 0.7,
        y: 1.4,
        w: 3.8,
        h: 0.7,
        fontSize: 24,
        bold: true,
        color: "FFFFFF",
        fontFace: theme.fontDisplay,
      });
      s.addText(slide.city, {
        x: 0.7,
        y: 2.2,
        w: 3.8,
        h: 0.4,
        fontSize: 14,
        color: "FFFFFF",
        fontFace: theme.fontBody,
      });
      s.addText(slide.body.slice(0, 220), {
        x: 0.7,
        y: 2.9,
        w: 3.8,
        h: 1.4,
        fontSize: 12,
        color: "FFFFFF",
        fontFace: theme.fontBody,
      });
      slide.points.slice(0, 6).forEach((point, i) => {
        s.addText(`▸  ${point}`, {
          x: 5.1,
          y: 1.1 + i * 0.55,
          w: 4.4,
          h: 0.45,
          fontSize: 13,
          color: hex(theme.ink),
          fontFace: theme.fontBody,
        });
      });
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "floorplan") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.3,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      s.addText(slide.caption, {
        x: 0.45,
        y: 0.75,
        w: 9,
        h: 0.4,
        fontSize: 11,
        color: hex(theme.muted),
        fontFace: theme.fontBody,
      });
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.45,
        y: 1.25,
        w: 9.1,
        h: 3.6,
        fill: { color: hex(theme.accentSoft) },
        line: { color: hex(theme.primary), pt: 1 },
        rectRadius: 0.08,
      });
      for (const room of slide.rooms.slice(0, 8)) {
        const x = 0.55 + (room.x / 100) * 8.8;
        const y = 1.35 + (room.y / 100) * 3.3;
        const w = Math.max(0.7, (room.w / 100) * 8.8);
        const h = Math.max(0.45, (room.h / 100) * 3.3);
        s.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w,
          h,
          fill: { color: hex(theme.surface) },
          line: { color: hex(theme.primary), pt: 1 },
          rectRadius: 0.04,
        });
        s.addText(room.label, {
          x,
          y: y + h / 2 - 0.15,
          w,
          h: 0.3,
          fontSize: 10,
          align: "center",
          color: hex(theme.ink),
          fontFace: theme.fontBody,
          bold: true,
        });
      }
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "compare_matrix") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.3,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      const header = [
        {
          text: "Attribute",
          options: { bold: true, color: "FFFFFF", fill: { color: hex(theme.primary) } },
        },
        ...slide.columns.map((c) => ({
          text: c.slice(0, 28),
          options: { bold: true, color: "FFFFFF", fill: { color: hex(theme.primary) } },
        })),
      ];
      const body = slide.rows.map((row) => [
        { text: row.label, options: { bold: true, color: hex(theme.ink) } },
        ...row.values.map((v) => ({ text: v, options: { color: hex(theme.ink) } })),
      ]);
      const colCount = slide.columns.length + 1;
      const colW = Array.from({ length: colCount }, (_, i) => (i === 0 ? 2.2 : (7.0 / (colCount - 1))));
      s.addTable([header, ...body], {
        x: 0.45,
        y: 0.95,
        w: 9.1,
        colW,
        border: { type: "solid", pt: 0.5, color: "D0D5DD" },
        fontFace: theme.fontBody,
        fontSize: 11,
        align: "left",
        valign: "middle",
      });
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "spatial") {
      s.addText(slide.title, {
        x: 0.45,
        y: 0.3,
        w: 9,
        h: 0.4,
        fontSize: 22,
        bold: true,
        color: hex(theme.ink),
        fontFace: theme.fontDisplay,
      });
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 1.0,
        w: 8.4,
        h: 3.5,
        fill: { color: hex(theme.accentSoft) },
        line: { color: hex(theme.primary), pt: 1.5 },
        rectRadius: 0.12,
      });
      s.addText(slide.caption, {
        x: 1.1,
        y: 1.4,
        w: 7.8,
        h: 0.5,
        fontSize: 16,
        bold: true,
        color: hex(theme.ink),
        align: "center",
        fontFace: theme.fontDisplay,
      });
      s.addText(`Layout: ${slide.layoutHint} · Renderer: ${slide.renderer}`, {
        x: 1.1,
        y: 2.1,
        w: 7.8,
        h: 0.4,
        fontSize: 12,
        color: hex(theme.muted),
        align: "center",
        fontFace: theme.fontBody,
      });
      if (slide.rooms?.length) {
        s.addText(slide.rooms.map((r) => r.label).join("  ·  "), {
          x: 1.1,
          y: 2.8,
          w: 7.8,
          h: 0.8,
          fontSize: 13,
          color: hex(theme.primary),
          align: "center",
          fontFace: theme.fontBody,
        });
      }
      addFooter(pptx, s, theme, page);
      return;
    }

    if (slide.type === "cta") {
      s.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 5.625,
        fill: { color: hex(theme.primary) },
      });
      s.addText(slide.title, {
        x: 0.7,
        y: 1.2,
        w: 8.5,
        h: 0.7,
        fontSize: 28,
        bold: true,
        color: "FFFFFF",
        fontFace: theme.fontDisplay,
      });
      s.addText(slide.body, {
        x: 0.7,
        y: 2.0,
        w: 8.5,
        h: 0.7,
        fontSize: 14,
        color: "FFFFFF",
        fontFace: theme.fontBody,
      });
      slide.actions.slice(0, 4).forEach((action, i) => {
        s.addShape(pptx.ShapeType.roundRect, {
          x: 0.7 + (i % 2) * 4.4,
          y: 2.9 + Math.floor(i / 2) * 0.7,
          w: 4.1,
          h: 0.55,
          fill: { color: "FFFFFF" },
          rectRadius: 0.08,
        });
        s.addText(action, {
          x: 0.7 + (i % 2) * 4.4,
          y: 2.98 + Math.floor(i / 2) * 0.7,
          w: 4.1,
          h: 0.4,
          fontSize: 13,
          align: "center",
          color: hex(theme.primary),
          bold: true,
          fontFace: theme.fontBody,
        });
      });
      s.addText(slide.contactHint, {
        x: 0.7,
        y: 4.7,
        w: 8.5,
        h: 0.35,
        fontSize: 11,
        color: "FFFFFF",
        fontFace: theme.fontBody,
      });
      return;
    }

    // narrative (default)
    s.addText(slide.title, {
      x: 0.45,
      y: 0.35,
      w: 9,
      h: 0.45,
      fontSize: 22,
      bold: true,
      color: hex(theme.ink),
      fontFace: theme.fontDisplay,
    });
    s.addText(slide.body, {
      x: 0.45,
      y: 1.1,
      w: 9.1,
      h: 3.7,
      fontSize: 15,
      color: hex(theme.ink),
      fontFace: theme.fontBody,
      valign: "top",
    });
    addFooter(pptx, s, theme, page);
  });

  const out = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return Buffer.isBuffer(out) ? out : Buffer.from(out as ArrayBuffer);
}
