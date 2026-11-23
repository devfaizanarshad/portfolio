import { ImageResponse } from "next/og";

export const alt = "Faizan Arshad — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#0b0c0e",
          backgroundImage: "radial-gradient(circle at 82% 28%, rgba(255,107,53,0.24), rgba(11,12,14,0) 46%)",
          color: "#ede9e1",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 68,
              borderRadius: 999,
              background: "#ede9e1",
              color: "#0b0c0e",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            FA
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 32, fontWeight: 600 }}>Faizan Arshad</div>
            <div style={{ fontSize: 19, letterSpacing: 3, color: "#aaa59c" }}>
              FULL-STACK DEVELOPER
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontSize: 78, fontWeight: 700, lineHeight: 1.04 }}>
          <div style={{ display: "flex" }}>Websites &amp; apps that</div>
          <div style={{ display: "flex" }}>
            help your business grow
            <span style={{ color: "#ff6b35" }}>.</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#aaa59c",
          }}
        >
          <div style={{ display: "flex" }}>faizanarshad.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
