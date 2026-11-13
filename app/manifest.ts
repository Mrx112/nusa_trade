import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NusaTrade — Pengadaan B2B",
    short_name: "NusaTrade",
    description: "Marketplace pengadaan B2B untuk bisnis Indonesia.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f3",
    theme_color: "#137f51",
    lang: "id",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
