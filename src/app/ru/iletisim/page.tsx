import type { Metadata } from "next";
import { ContactView } from "@/views/ContactView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Контакты | Yatpaketi",
  description: "Свяжитесь с Yatpaketi через WhatsApp, по телефону или почте. Напишите даты — вместе подберём яхту и маршрут.",
  alternates: { canonical: "/ru/iletisim", languages: { tr: "/iletisim", en: "/en/iletisim", ru: "/ru/iletisim" } },
};

export default function ContactPage() {
  return <ContactView lang="ru" />;
}
