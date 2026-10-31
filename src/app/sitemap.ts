import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yatpaketi.com";

// Yalnızca gerçek içeriği olan sayfalar listelenir. Tekne, destinasyon ve blog sayfaları eklenince genişletilecek.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: base, lastModified: new Date() }];
}
