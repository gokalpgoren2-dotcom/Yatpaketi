import type { Metadata } from "next";
import { FaqView } from "@/views/FaqView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Frequently asked questions about boat charter, booking, payment, routes and life on board.",
  alternates: { canonical: "/en/sss", languages: { tr: "/sss", en: "/en/sss" } },
};

export default function FaqPage() {
  return <FaqView lang="en" />;
}
