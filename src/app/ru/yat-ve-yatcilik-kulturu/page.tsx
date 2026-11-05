import type { Metadata } from "next";
import { ruText } from "@/lib/ru";
import { CultureView } from "@/views/CultureView";
import { CULTURE } from "@/lib/culture";

export const revalidate = 60;
export const metadata: Metadata = {
  title: ruText(CULTURE.en.title),
  description: ruText(CULTURE.en.meta),
  alternates: { canonical: "/ru/yat-ve-yatcilik-kulturu", languages: { tr: "/yat-ve-yatcilik-kulturu", en: "/en/yat-ve-yatcilik-kulturu", ru: "/ru/yat-ve-yatcilik-kulturu" } },
};

export default function CulturePage() {
  return <CultureView lang="ru" />;
}
