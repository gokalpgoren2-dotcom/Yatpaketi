import { HeaderClient, type NavLink } from "./HeaderClient";
import { getNavInfo } from "@/lib/posts";
import { getCategories } from "@/lib/content";

// Menüde yalnızca içeriği olan bağlantılar görünür; böylece boş sayfaya giden düğme olmaz.
export async function Header() {
  const [nav, cats] = await Promise.all([getNavInfo(), getCategories()]);
  const about = nav.pages.some((p) => p.slug === "hakkimizda");
  const links: NavLink[] = [
    { href: "/", label: "Ana Sayfa" },
    {
      href: "/tekneler",
      label: "Kiralık Tekneler",
      children: [{ href: "/tekneler", label: "Tüm tekneler", icon: "all" }, ...cats.map((c) => ({ href: `/tekne-tipleri/${c.slug}`, label: c.name, icon: c.slug }))],
    },
    { href: "/destinasyonlar", label: "Destinasyonlar" },
    ...(nav.hasGuides ? [{ href: "/rehber", label: "Yatpaketi Rehberi" }] : [{ href: "/#mavi-yolculuk", label: "Mavi Yolculuk" }]),
    ...(nav.hasBlog ? [{ href: "/blog", label: "Blog" }] : []),
    { href: about ? "/hakkimizda" : "/#hakkimizda", label: "Hakkımızda" },
    { href: "/#iletisim", label: "İletişim" },
  ];
  return <HeaderClient links={links} />;
}
