import { HeaderClient, type NavLink } from "./HeaderClient";
import { gt } from "@/lib/guide-text";
import { getNavInfo } from "@/lib/posts";
import { getCategories, getContact, getDestinations } from "@/lib/content";
import { socialList } from "./SocialLinks";
import { href, t, type Lang } from "@/lib/i18n";

// Menüde yalnızca içeriği olan bağlantılar görünür; böylece boş sayfaya giden düğme olmaz.
export async function Header({ lang = "tr" }: { lang?: Lang } = {}) {
  const L = t(lang);
  const [nav, cats, dests, contact] = await Promise.all([getNavInfo(lang), getCategories(lang), getDestinations(lang), getContact()]);
  const en = lang === "en";
  // İngilizce yazılar (rehber, blog, sayfalar) henüz yok; o bağlantılar yalnızca Türkçe menüde görünür.
  const about = true; // Hakkımızda artık özel sayfa
  // Yatpaketi Rehberi açılır menüsü: yalnızca içeriği olan bölümler görünür.
  const G = gt(lang);
  const pageLink = (slug: string) => nav.pages.find((p) => p.slug === slug)?.title;
  const guide: { href: string; label: string; icon?: string }[] = [
    ...(nav.hasDestinations ? [{ href: href(lang, "/destinasyonlar"), label: G.destinations, icon: "pin" }] : []),
    ...(nav.hasRoutes ? [{ href: href(lang, "/rotalar"), label: G.routes, icon: "route" }] : []),
    ...(nav.hasProcess ? [{ href: href(lang, "/kiralama-sureci"), label: G.process, icon: "process" }] : []),
    { href: href(lang, "/sss"), label: G.faq, icon: "book" },
    { href: href(lang, "/yat-ve-yatcilik-kulturu"), label: G.culture, icon: "compass" },
    ...(!en && nav.hasBlog ? [{ href: "/blog", label: L.navBlog, icon: "book" }] : []),
    ...(nav.hasGuides ? [{ href: href(lang, "/rehber") + "#yazilar", label: G.articles, icon: "book" }] : []),
    { href: href(lang, "/hizmetlerimiz"), label: L.navServices, icon: "all" },
    ...(about ? [{ href: href(lang, "/hakkimizda"), label: L.navAbout, icon: "about" }] : []),
  ];
  const aboutInGuide = guide.length > 0 && about;
  const links: NavLink[] = [
    {
      href: href(lang, "/tekneler"),
      label: L.navBoats,
      children: [{ href: href(lang, "/tekneler"), label: L.navAllBoats, icon: "all" }, ...cats.map((c) => ({ href: href(lang, `/tekne-tipleri/${c.slug}`), label: c.name, icon: c.slug })), { href: href(lang, "/tekne-karsilastir"), label: lang === "en" ? "Compare yachts" : "Yatları karşılaştır", icon: "all" }],
    },
    {
      href: href(lang, "/limanlar"),
      label: L.navDest,
      children: [{ href: href(lang, "/limanlar"), label: L.navAllDest, icon: "compass" }, ...dests.map((d) => ({ href: href(lang, `/limanlar/${d.slug}`), label: d.name, icon: "pin" }))],
    },
    ...(guide.length > 0 ? [{ href: href(lang, "/rehber"), label: L.navGuide, children: guide }] : [{ href: href(lang, "/#mavi-yolculuk"), label: L.navBlueVoyage }]),
    ...(aboutInGuide ? [] : [{ href: about ? href(lang, "/hakkimizda") : href(lang, "/#hakkimizda"), label: L.navAbout }]),
    { href: href(lang, "/iletisim"), label: L.navContact },
  ];
  return <HeaderClient links={links} lang={lang} socials={socialList(contact)} />;
}
