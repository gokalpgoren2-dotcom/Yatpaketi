import type { Metadata } from "next";
import { ContactView } from "@/views/ContactView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "İletişim | Yatpaketi",
  description: "Yatpaketi ile iletişime geçin: WhatsApp, telefon veya e-posta. Tarihlerinizi yazın, size uygun tekne ve rotayı birlikte netleştirelim.",
  alternates: { canonical: "/iletisim", languages: { tr: "/iletisim", en: "/en/iletisim" } },
};

export default function ContactPage() {
  return <ContactView lang="tr" />;
}
