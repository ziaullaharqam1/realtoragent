"use client";

import type { CSSProperties } from "react";
import type { PresentationSlide } from "@/lib/ai-agent/presentations/spec";
import type { CanvasTheme } from "./types";

type Props = {
  slide: PresentationSlide;
  theme: CanvasTheme;
  index: number;
  total: number;
  /** compact = filmstrip / studio thumb */
  density?: "stage" | "thumb";
};

/**
 * Visual 16:9 slide surface — Canva / Gamma style, not a JSON dump.
 */
export function SlideStage({ slide, theme, index, total, density = "stage" }: Props) {
  const muted = theme.muted ?? "#5b667a";
  const soft = theme.accentSoft ?? "#d8efed";
  const secondary = theme.secondary ?? theme.primary;
  const pad = density === "thumb" ? "0.55rem" : "clamp(1.25rem, 3vw, 2.5rem)";
  const titleSize = density === "thumb" ? "0.85rem" : "clamp(1.75rem, 4vw, 3rem)";

  const shell: CSSProperties = {
    aspectRatio: "16 / 9",
    width: "100%",
    overflow: "hidden",
    position: "relative",
    background: theme.surface,
    color: theme.ink,
    fontFamily: "var(--font-body)",
  };

  if (slide.type === "cover") {
    return (
      <div style={shell} data-slide-type="cover">
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 70% at 85% 20%, ${secondary}55, transparent 55%),
              linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}ee 42%, ${theme.surface} 42.2%)
            `,
          }}
        />
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr",
            padding: pad,
            gap: density === "thumb" ? "0.4rem" : "1.5rem",
          }}
        >
          <div style={{ color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <p
                style={{
                  margin: 0,
                  opacity: 0.85,
                  letterSpacing: "0.14em",
                  fontSize: density === "thumb" ? "0.45rem" : "0.78rem",
                  textTransform: "uppercase",
                }}
              >
                {slide.eyebrow ?? "PropPilot"}
              </p>
              <p
                style={{
                  margin: density === "thumb" ? "0.25rem 0 0" : "0.65rem 0 0",
                  fontWeight: 700,
                  fontSize: density === "thumb" ? "0.55rem" : "0.95rem",
                  color: soft,
                }}
              >
                {slide.badge ?? "Listing dossier"}
              </p>
            </div>
            <p style={{ margin: 0, opacity: 0.7, fontSize: density === "thumb" ? "0.4rem" : "0.8rem" }}>
              {index + 1} / {total}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {slide.kicker ? (
              <p
                style={{
                  margin: 0,
                  color: muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: density === "thumb" ? "0.4rem" : "0.72rem",
                }}
              >
                {slide.kicker}
              </p>
            ) : null}
            <h2
              className="pp-display"
              style={{
                margin: density === "thumb" ? "0.2rem 0 0" : "0.55rem 0 0",
                fontSize: titleSize,
                lineHeight: 1.08,
                color: theme.ink,
              }}
            >
              {slide.title}
            </h2>
            <p
              style={{
                margin: density === "thumb" ? "0.35rem 0 0" : "1rem 0 0",
                color: theme.primary,
                fontWeight: 750,
                fontSize: density === "thumb" ? "0.55rem" : "1.35rem",
              }}
            >
              {slide.subtitle}
            </p>
            <p
              style={{
                margin: density === "thumb" ? "0.15rem 0 0" : "0.4rem 0 0",
                color: muted,
                fontSize: density === "thumb" ? "0.45rem" : "1rem",
              }}
            >
              {slide.location}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === "metrics") {
    return (
      <div style={{ ...shell, padding: pad }} data-slide-type="metrics">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: 0, fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        <div
          style={{
            marginTop: density === "thumb" ? "0.45rem" : "1.4rem",
            display: "grid",
            gap: density === "thumb" ? "0.3rem" : "0.85rem",
            gridTemplateColumns: `repeat(${Math.min(slide.items.length, 5)}, minmax(0, 1fr))`,
            height: density === "thumb" ? "68%" : "72%",
          }}
        >
          {slide.items.map((item) => (
            <div
              key={item.label}
              style={{
                background: `linear-gradient(180deg, ${soft}, ${theme.surface})`,
                borderRadius: density === "thumb" ? 6 : 18,
                border: `1px solid ${theme.primary}22`,
                padding: density === "thumb" ? "0.35rem" : "1.1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: density === "thumb" ? "0.35rem" : "0.72rem",
                  color: muted,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </span>
              <strong style={{ fontSize: density === "thumb" ? "0.7rem" : "2rem", lineHeight: 1 }}>
                {item.value}
              </strong>
              {item.hint ? (
                <span style={{ color: theme.primary, fontSize: density === "thumb" ? "0.35rem" : "0.85rem" }}>
                  {item.hint}
                </span>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "highlights") {
    return (
      <div style={{ ...shell, padding: pad }} data-slide-type="highlights">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: "0 0 0.75rem", fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        <div
          style={{
            display: "grid",
            gap: density === "thumb" ? "0.3rem" : "0.75rem",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          {slide.items.slice(0, 6).map((item) => (
            <div
              key={item.title}
              style={{
                background: soft,
                borderRadius: density === "thumb" ? 6 : 14,
                padding: density === "thumb" ? "0.35rem 0.4rem" : "0.95rem 1rem",
                borderLeft: `${density === "thumb" ? 2 : 4}px solid ${theme.primary}`,
              }}
            >
              <strong style={{ display: "block", fontSize: density === "thumb" ? "0.45rem" : "1rem" }}>
                {item.title}
              </strong>
              <span style={{ color: muted, fontSize: density === "thumb" ? "0.38rem" : "0.9rem" }}>{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "facts") {
    return (
      <div style={{ ...shell, padding: pad }} data-slide-type="facts">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: "0 0 0.65rem", fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: density === "thumb" ? "0.2rem 0.5rem" : "0.35rem 1.5rem",
          }}
        >
          {slide.rows.slice(0, density === "thumb" ? 8 : 12).map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: density === "thumb" ? "0.2rem 0" : "0.45rem 0",
                borderBottom: `1px solid ${soft}`,
                fontSize: density === "thumb" ? "0.4rem" : "0.95rem",
              }}
            >
              <span style={{ color: muted }}>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "amenities") {
    return (
      <div style={{ ...shell, padding: pad }} data-slide-type="amenities">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: "0 0 0.85rem", fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: density === "thumb" ? "0.25rem" : "0.65rem" }}>
          {slide.items.map((item) => (
            <span
              key={item}
              style={{
                background: soft,
                color: theme.ink,
                borderRadius: 999,
                padding: density === "thumb" ? "0.2rem 0.4rem" : "0.55rem 1rem",
                fontWeight: 700,
                fontSize: density === "thumb" ? "0.4rem" : "0.95rem",
                border: `1px solid ${theme.primary}33`,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "gallery") {
    return (
      <div style={{ ...shell, padding: pad }} data-slide-type="gallery">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: 0, fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        {density === "stage" ? (
          <p style={{ margin: "0.35rem 0 0.9rem", color: muted, fontSize: "0.9rem" }}>{slide.caption}</p>
        ) : (
          <div style={{ height: "0.35rem" }} />
        )}
        <div
          style={{
            display: "grid",
            gap: density === "thumb" ? "0.25rem" : "0.75rem",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            height: density === "thumb" ? "70%" : "68%",
          }}
        >
          {slide.frames.slice(0, 4).map((frame, i) => (
            <div
              key={frame.label}
              style={{
                borderRadius: density === "thumb" ? 6 : 16,
                overflow: "hidden",
                background: soft,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: density === "thumb" ? 28 : 110,
                  background: `linear-gradient(${120 + i * 20}deg, ${theme.primary}, ${secondary}cc, ${soft})`,
                }}
              />
              <div style={{ padding: density === "thumb" ? "0.25rem" : "0.7rem" }}>
                <strong style={{ display: "block", fontSize: density === "thumb" ? "0.4rem" : "0.95rem" }}>
                  {frame.label}
                </strong>
                {density === "stage" ? (
                  <span style={{ color: muted, fontSize: "0.8rem" }}>{frame.note}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "neighborhood") {
    return (
      <div style={{ ...shell, display: "grid", gridTemplateColumns: "42% 1fr" }} data-slide-type="neighborhood">
        <div
          style={{
            background: `linear-gradient(160deg, ${theme.primary}, ${secondary})`,
            color: "#fff",
            padding: pad,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h3 className="pp-display" style={{ margin: 0, fontSize: density === "thumb" ? "0.65rem" : "1.5rem" }}>
            {slide.title}
          </h3>
          <p
            style={{
              margin: density === "thumb" ? "0.35rem 0 0" : "1rem 0 0",
              fontSize: density === "thumb" ? "0.85rem" : "2rem",
              fontWeight: 750,
            }}
          >
            {slide.district}
          </p>
          <p style={{ margin: "0.2rem 0 0", opacity: 0.85, fontSize: density === "thumb" ? "0.45rem" : "1rem" }}>
            {slide.city}
          </p>
          {density === "stage" ? (
            <p style={{ margin: "1.1rem 0 0", lineHeight: 1.55, opacity: 0.92, fontSize: "0.95rem" }}>{slide.body}</p>
          ) : null}
        </div>
        <div style={{ padding: pad, background: theme.surface, display: "grid", alignContent: "center", gap: density === "thumb" ? "0.25rem" : "0.65rem" }}>
          {slide.points.slice(0, 6).map((point) => (
            <div
              key={point}
              style={{
                padding: density === "thumb" ? "0.25rem 0.35rem" : "0.75rem 0.9rem",
                background: soft,
                borderRadius: density === "thumb" ? 4 : 12,
                borderLeft: `${density === "thumb" ? 2 : 3}px solid ${theme.primary}`,
                fontSize: density === "thumb" ? "0.4rem" : "0.95rem",
              }}
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "floorplan") {
    return (
      <div style={{ ...shell, padding: pad }} data-slide-type="floorplan">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: 0, fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        {density === "stage" ? (
          <p style={{ margin: "0.3rem 0 0.75rem", color: muted, fontSize: "0.85rem" }}>{slide.caption}</p>
        ) : (
          <div style={{ height: "0.3rem" }} />
        )}
        <div
          style={{
            position: "relative",
            height: density === "thumb" ? "72%" : "74%",
            borderRadius: density === "thumb" ? 8 : 18,
            border: `1px solid ${theme.primary}66`,
            background: `
              linear-gradient(90deg, ${theme.primary}08 1px, transparent 1px) 0 0 / ${density === "thumb" ? 12 : 28}px ${density === "thumb" ? 12 : 28}px,
              linear-gradient(${theme.primary}08 1px, transparent 1px) 0 0 / ${density === "thumb" ? 12 : 28}px ${density === "thumb" ? 12 : 28}px,
              ${soft}
            `,
            overflow: "hidden",
          }}
        >
          {slide.rooms.map((room) => (
            <div
              key={room.id}
              style={{
                position: "absolute",
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.w}%`,
                height: `${room.h}%`,
                border: `2px solid ${theme.primary}`,
                background: "rgba(255,255,255,0.78)",
                borderRadius: 8,
                fontSize: density === "thumb" ? 7 : 12,
                fontWeight: 700,
                padding: density === "thumb" ? 2 : 6,
                boxSizing: "border-box",
              }}
            >
              {room.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slide.type === "compare_matrix") {
    return (
      <div style={{ ...shell, padding: pad, overflow: "hidden" }} data-slide-type="compare_matrix">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: "0 0 0.65rem", fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: density === "thumb" ? "0.38rem" : "0.9rem",
          }}
        >
          <thead>
            <tr style={{ background: theme.primary, color: "#fff" }}>
              <th style={{ textAlign: "left", padding: density === "thumb" ? "0.2rem" : "0.6rem" }}>Attribute</th>
              {slide.columns.map((c) => (
                <th key={c} style={{ textAlign: "left", padding: density === "thumb" ? "0.2rem" : "0.6rem" }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slide.rows.map((row, ri) => (
              <tr key={row.label} style={{ background: ri % 2 ? soft : "transparent" }}>
                <td style={{ padding: density === "thumb" ? "0.15rem" : "0.55rem", fontWeight: 650 }}>{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={`${row.label}-${i}`} style={{ padding: density === "thumb" ? "0.15rem" : "0.55rem" }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (slide.type === "spatial") {
    return (
      <div style={{ ...shell, padding: pad }} data-slide-type="spatial">
        <Decor theme={theme} />
        <h3 className="pp-display" style={{ margin: "0 0 0.55rem", fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
          {slide.title}
        </h3>
        <div
          style={{
            position: "relative",
            height: density === "thumb" ? "75%" : "78%",
            borderRadius: density === "thumb" ? 8 : 20,
            overflow: "hidden",
            background: `
              radial-gradient(circle at 30% 35%, ${soft}, transparent 55%),
              linear-gradient(145deg, ${theme.primary}22, ${secondary}33, ${theme.surface})
            `,
            border: `1px solid ${theme.primary}33`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "16% 20%",
              border: `2px solid ${theme.primary}99`,
              borderRadius: 12,
              transform: "perspective(800px) rotateX(56deg) rotateZ(-14deg)",
              background: "rgba(255,255,255,0.45)",
              boxShadow: "0 22px 50px rgba(11,18,32,0.16)",
            }}
          />
          {(slide.rooms ?? []).slice(0, 4).map((room, i) => (
            <div
              key={room.id}
              style={{
                position: "absolute",
                left: `${16 + i * 17}%`,
                top: `${26 + (i % 2) * 12}%`,
                padding: density === "thumb" ? "0.1rem 0.25rem" : "0.3rem 0.55rem",
                background: theme.primary,
                color: "#fff",
                borderRadius: 8,
                fontSize: density === "thumb" ? 7 : 12,
                fontWeight: 700,
              }}
            >
              {room.label}
            </div>
          ))}
          <div style={{ position: "absolute", left: "8%", right: "8%", bottom: "8%" }}>
            <strong style={{ display: "block", fontSize: density === "thumb" ? "0.45rem" : "1.05rem" }}>
              {slide.caption}
            </strong>
            {density === "stage" ? (
              <span style={{ color: muted, fontSize: "0.88rem" }}>
                {slide.layoutHint} · visual preview
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === "cta") {
    return (
      <div
        style={{
          ...shell,
          background: `linear-gradient(145deg, ${theme.primary} 0%, ${secondary} 55%, ${theme.primary} 100%)`,
          color: "#fff",
          padding: pad,
          display: "grid",
          alignContent: "center",
          gap: density === "thumb" ? "0.35rem" : "1rem",
        }}
        data-slide-type="cta"
      >
        <h3 className="pp-display" style={{ margin: 0, fontSize: density === "thumb" ? "0.8rem" : "2.2rem" }}>
          {slide.title}
        </h3>
        <p style={{ margin: 0, opacity: 0.92, maxWidth: 640, fontSize: density === "thumb" ? "0.45rem" : "1.05rem", lineHeight: 1.5 }}>
          {slide.body}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: density === "thumb" ? "0.25rem" : "0.65rem" }}>
          {slide.actions.map((action) => (
            <span
              key={action}
              style={{
                background: "#fff",
                color: theme.primary,
                borderRadius: 999,
                padding: density === "thumb" ? "0.2rem 0.4rem" : "0.6rem 1.1rem",
                fontWeight: 750,
                fontSize: density === "thumb" ? "0.4rem" : "0.92rem",
              }}
            >
              {action}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...shell, padding: pad }} data-slide-type="narrative">
      <Decor theme={theme} />
      <h3 className="pp-display" style={{ margin: "0 0 0.75rem", fontSize: density === "thumb" ? "0.7rem" : "1.6rem" }}>
        {slide.title}
      </h3>
      <p
        style={{
          margin: 0,
          lineHeight: 1.65,
          color: muted,
          fontSize: density === "thumb" ? "0.45rem" : "1.05rem",
          maxWidth: "42rem",
        }}
      >
        {slide.body}
      </p>
    </div>
  );
}

function Decor({ theme }: { theme: CanvasTheme }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: `
          radial-gradient(ellipse 50% 40% at 100% 0%, ${theme.primary}18, transparent 60%),
          linear-gradient(180deg, ${theme.primary} 0, ${theme.primary} 4px, transparent 4px)
        `,
      }}
    />
  );
}
