import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Finite Life",
    short_name: "Finite Life",
    description:
      "4000 weeks. Make them count. A Memento Mori productivity companion.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F5F0",
    theme_color: "#F5F5F0",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["productivity", "lifestyle"],
  };
}