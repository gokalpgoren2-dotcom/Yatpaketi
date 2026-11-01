import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { FavoritesClient } from "@/components/FavoritesClient";
import { getBoats, getContact } from "@/lib/content";
import type { Lang } from "@/lib/i18n";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export async function FavoritesView({ lang }: { lang: Lang }) {
  const [{ boats }, c] = await Promise.all([getBoats(lang), getContact()]);
  const en = lang === "en";
  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="bg-gradient-to-r from-navy to-[#0b4a66] pb-12 pt-28 text-white lg:pb-16 lg:pt-36">
          <div className={`${wrap} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between`}>
            <h1 className="font-display text-4xl font-medium leading-tight lg:text-6xl">{en ? "Your saved" : "Favori"}<br /><span className="text-turquoise">{en ? "yachts." : "tekneleriniz."}</span></h1>
            <p className="max-w-md border-white/25 text-white/80 lg:border-l lg:pl-6 lg:text-lg">{en ? "Compare your picks side by side, then ask us about all of them in one message." : "Beğendiklerinizi yan yana karşılaştırın, hepsini tek mesajla bize sorun."}</p>
          </div>
        </section>
        <section className="py-12 pb-24 lg:py-16">
          <div className={wrap}><FavoritesClient boats={boats} whatsapp={c.whatsapp} email={c.email} lang={lang} /></div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
