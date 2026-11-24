import type { MetadataRoute } from "next";

// "Ana ekrana ekle" ile telefona yüklenince site, adres çubuğu olmadan kendi simgesiyle açılır.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yatpaketi",
    short_name: "Yatpaketi",
    description: "Yat kiralama: gulet, motoryat, yelkenli ve katamaran.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#06264B",
    theme_color: "#06264B",
    lang: "tr",
    icons: [
      { src: "/app-192.png", sizes: "192x192", type: "image/png" },
      { src: "/app-512.png", sizes: "512x512", type: "image/png" },
      { src: "/app-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
