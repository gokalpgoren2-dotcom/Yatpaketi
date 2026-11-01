import { HeaderClient, type NavLink } from "./HeaderClient";
import { getNavInfo } from "@/lib/posts";
import { getCategories, getDestinations } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

// Menüde yalnızca içeriği olan bağlantılar görünür; böylece boş sayfaya giden düğme olmaz.
export async function Header({ lang = "tr" }: { lang?: Lang } = {}) {
  const L = t(lang);
  const [nav, cats, dests] = await Promise.all([getNavInfo(), getCategories(lang), getDestinations(lang)]);
  const en = lang === "en";
  // İngilizce yazılar (rehber, blog, sayfalar) henüz yok; o bağlantılar yalnızca Türkçe menüde görünür.
  const about = nav.pages.some((p) => p.slug === "hakkimizda");
  // Yatpaketi Rehberi açılır menüsü: yalnızca içeriği olan bölümler görünür (Türkçe menüde).
  const guide: { href: string; label: string; icon?: string }[] = [
    ...(nav.hasDestinations ? [{ href: "/destinasyonlar", label: en ? "Destinations (Turkish)" : "Destinasyonlar", icon: "pin" }] : []),
    ...(nav.hasRoutes ? [{ href: "/rotalar", label: en ? "Classic Routes (Turkish)" : "Klasik Rotalar", icon: "route" }] : []),
    ...(nav.hasPackages ? [{ href: "/tur-paketleri", label: en ? "Tour Packages (Turkish)" : "Tur Paketleri", icon: "package" }] : []),
    ...(nav.hasProcess ? [{ href: "/kiralama-sureci", label: en ? "Charter Process (Turkish)" : "Kiralama Süreci", icon: "process" }] : []),
    ...(nav.hasGuides ? [{ href: "/rehber#yazilar", label: en ? "Guide Articles (Turkish)" : "Rehber Yazıları", icon: "book" }] : []),
    ...(about ? [{ href: "/hakkimizda", label: L.navAbout, icon: "about" }] : []),
  ];
  const aboutInGuide = guide.length > 0 && about;
  const links: NavLink[] = [
    { href: href(lang, "/"), label: L.navHome },
    {
      href: href(lang, "/tekneler"),
      label: L.navBoats,
      children: [{ href: href(lang, "/tekneler"), label: L.navAllBoats, icon: "all" }, ...cats.map((c) => ({ href: href(lang, `/tekne-tipleri/${c.slug}`), label: c.name, icon: c.slug }))],
    },
    {
      href: href(lang, "/limanlar"),
      label: L.navDest,
      children: [{ href: href(lang, "/limanlar"), label: L.navAllDest, icon: "compass" }, ...dests.map((d) => ({ href: href(lang, `/limanlar/${d.slug}`), label: d.name, icon: "pin" }))],
    },
    ...(guide.length > 0 ? [{ href: "/rehber", label: L.navGuide, children: guide }] : [{ href: href(lang, "/#mavi-yolculuk"), label: L.navBlueVoyage }]),
    ...(!en && nav.hasBlog ? [{ href: "/blog", label: L.navBlog }] : []),
    ...(aboutInGuide ? [] : [{ href: about ? "/hakkimizda" : href(lang, "/#hakkimizda"), label: L.navAbout }]),
    { href: href(lang, "/#iletisim"), label: L.navContact },
  ];
  return <HeaderClient links={links} lang={lang} />;
}
