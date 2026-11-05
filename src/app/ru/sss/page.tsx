import type { Metadata } from "next";
import { FaqView } from "@/views/FaqView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Частые вопросы",
  description: "Частые вопросы об аренде яхт, бронировании, оплате, маршрутах и жизни на борту.",
  alternates: { canonical: "/ru/sss", languages: { tr: "/sss", en: "/en/sss", ru: "/ru/sss" } },
};

export default function FaqPage() {
  return <FaqView lang="ru" />;
}
