import type { Metadata } from "next";
import { GuideHubView } from "@/views/GuideHubView";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Yatpaketi Guide",
  description: gt("en").metaHub,
  alternates: { canonical: "/en/rehber", languages: { tr: "/rehber", en: "/en/rehber", ru: "/ru/rehber" } },
};

export default function GuidePage() {
  return <GuideHubView lang="en" />;
}
