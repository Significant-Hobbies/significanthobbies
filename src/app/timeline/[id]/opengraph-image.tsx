import { eq } from "drizzle-orm";
import { ImageResponse } from "next/og";

import { timelines, users } from "~/db/schema";
import { computePersonality } from "~/lib/personality";
import type { Phase } from "~/lib/types";
import { db } from "~/server/db";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function fallbackImage(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FEFDF8",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          fontFamily: "system-ui, sans-serif",
          color: "#78716C",
        }}
      >
        {message}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let timeline: Awaited<ReturnType<typeof db.query.timelines.findFirst>>;
  try {
    timeline = await db.query.timelines.findFirst({
      where: eq(timelines.id, id),
    });
  } catch (err) {
    console.error("opengraph-image: timeline lookup failed", err);
    return fallbackImage("Significant Hobbies");
  }

  if (!timeline) return fallbackImage("Timeline not found");

  // Never render private timeline content on this unauthenticated endpoint
  // (link unfurlers fetch it without cookies and cache the result).
  if (timeline.visibility === "PRIVATE") {
    return fallbackImage("Significant Hobbies");
  }

  let timelineUser: { name: string | null; username: string | null } | null = null;
  if (timeline.userId) {
    try {
      timelineUser =
        (await db.query.users.findFirst({
          where: eq(users.id, timeline.userId),
          columns: { name: true, username: true },
        })) ?? null;
    } catch (err) {
      console.error("opengraph-image: user lookup failed", err);
    }
  }

  let phases: Phase[] = [];
  try {
    phases = JSON.parse(timeline.phases) as Phase[];
  } catch {
    /* ignore */
  }

  const totalHobbies = new Set(
    phases.flatMap((p) => p.hobbies.map((h) => h.name)),
  ).size;

  const personality = computePersonality(phases);
  const archetype = personality.archetype;

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #FEFDF8 0%, #ECFDF5 60%, #FFF8EE 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <div style={{ fontSize: 22, color: "#059669", fontWeight: 700 }}>
            significanthobbies.com
          </div>
          {timelineUser?.username && (
            <div style={{ fontSize: 22, color: "#78716C" }}>
              @{timelineUser.username}
            </div>
          )}
        </div>

        {/* Timeline title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#1C1917",
            lineHeight: 1.2,
            marginBottom: 24,
            maxWidth: 800,
          }}
        >
          {timeline.title ?? "Hobby Timeline"}
        </div>

        {/* Personality archetype badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 28px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #D1FAE5 0%, #FEF3C7 100%)",
              border: "2px solid #A7F3D0",
            }}
          >
            <span style={{ fontSize: 32 }}>{archetype.emoji}</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                Personality
              </span>
              <span style={{ fontSize: 24, color: "#1C1917", fontWeight: 800 }}>
                {archetype.name}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: "#ECFDF5",
              color: "#059669",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {phases.length} phase{phases.length !== 1 ? "s" : ""}
          </div>
          <div
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              background: "#FEF3C7",
              color: "#D97706",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {totalHobbies} hobb{totalHobbies !== 1 ? "ies" : "y"}
          </div>
        </div>

        {/* Phase labels */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {phases.slice(0, 5).map((p, i) => (
            <div
              key={p.id}
              style={{
                padding: "10px 20px",
                borderRadius: 24,
                background: `hsl(${160 - i * 25}, 60%, 90%)`,
                color: `hsl(${160 - i * 25}, 60%, 30%)`,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
