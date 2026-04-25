import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #FEFDF8 0%, #ECFDF5 40%, #FFF8EE 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            SH
          </div>
          <span style={{ fontSize: 36, fontWeight: 700, color: "#1C1917" }}>
            SignificantHobbies
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#1C1917",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: 900,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 8px",
          }}
        >
          <span>Your hobbies tell a</span>
          <span style={{ color: "#059669" }}>significant</span>
          <span>story</span>
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: 28,
            color: "#78716C",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          Map your hobby journey across life phases
        </div>

        {/* Phase strip decoration */}
        <div style={{ display: "flex", gap: 8, marginTop: 48 }}>
          {["Childhood", "Teen Years", "College", "Career", "Now"].map((label, i) => (
            <div
              key={label}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                background: `hsl(${160 - i * 30}, 65%, ${88 - i * 3}%)`,
                color: `hsl(${160 - i * 30}, 65%, 30%)`,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
