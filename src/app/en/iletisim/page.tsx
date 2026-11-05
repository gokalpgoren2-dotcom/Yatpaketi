import type { Metadata } from "next";
import { ContactView } from "@/views/ContactView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Contact | Yatpaketi",
  description: "Get in touch with Yatpaketi by WhatsApp, phone or email. Tell us your dates and we'll shape the right yacht and route together.",
  alternates: { canonical: "/en/iletisim", languages: { tr: "/iletisim", en: "/en/iletisim", ru: "/ru/iletisim" } },
};

export default function ContactPage() {
  return <ContactView lang="en" />;
}
