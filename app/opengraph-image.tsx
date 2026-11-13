import { ImageResponse } from "next/og";

export const alt = "NusaTrade — Marketplace pengadaan B2B Indonesia";
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
          padding: 72,
          background: "linear-gradient(135deg, #06261a 0%, #116543 60%, #1f9d65 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#137f51", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 800 }}>M</div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
            <span>Nusa</span>
            <span style={{ color: "#74d2a4" }}>Trade</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>Pengadaan bisnis,</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, color: "#f9bd3f" }}>lebih cerdas.</div>
          <div style={{ fontSize: 30, marginTop: 28, color: "rgba(255,255,255,0.8)" }}>
            Pemasok terverifikasi · Harga grosir bertingkat · RFQ ke banyak pemasok
          </div>
        </div>
      </div>
    ),
    size,
  );
}
