import type { Metadata } from "next";
import { CultureView } from "@/views/CultureView";
import { CULTURE } from "@/lib/culture";

export const revalidate = 60;
export const metadata: Metadata = {
  title: CULTURE.tr.title,
  description: CULTURE.tr.meta,
  alternates: { canonical: "/yat-ve-yatcilik-kulturu", languages: { tr: "/yat-ve-yatcilik-kulturu", en: "/en/yat-ve-yatcilik-kulturu" } },
};

export default function CulturePage() {
  return <CultureView lang="tr" />;
}
