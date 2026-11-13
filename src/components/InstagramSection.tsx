import { getPosts, igUser } from "@/lib/instagram";

type L = "tr" | "en" | "ru";

const IgIcon = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
);

// Açıklamanın ilk satırı, etiketler (#...) atılmış hali.
const short = (c?: string) => (c ?? "").split("\n").map((x) => x.replace(/#[^\s#]+/g, "").trim()).find(Boolean) ?? "";

// Ana sayfa: Instagram'daki son paylaşımlar. Büyük ekranda bir büyük + dört küçük kare; telefonda yana kaydırılan kartlar.
// Erişim anahtarı yoksa görünmez.
export async function InstagramSection({ lang = "tr" }: { lang?: L }) {
  const posts = await getPosts();
  if (posts.length === 0) return null;
  const user = igUser();
  const profile = `https://www.instagram.com/${user}/`;
  const ru = lang === "ru", en = lang !== "tr";
  const T = {
    h: ru ? "Последние кадры с моря" : en ? "Latest from the sea" : "Denizden son kareler",
    p: ru ? "Бухты, яхты и жизнь на борту — в нашем Instagram." : en ? "Bays, yachts and life on board — follow along on Instagram." : "Koylar, yatlar ve teknede hayat; hepsi Instagram'da.",
    follow: ru ? "Подписаться" : en ? "Follow" : "Takip et",
    more: ru ? "Больше в Instagram" : en ? "More on Instagram" : "Devamı Instagram'da",
  };
  const mosaic = posts.length >= 5;
  const shown = posts.slice(0, mosaic ? 6 : 4);
  const nf = new Intl.NumberFormat(lang === "tr" ? "tr-TR" : lang === "ru" ? "ru-RU" : "en-US");
  return (
    <section className="bg-gradient-to-b from-white via-mist to-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 lg:mb-10">
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-full bg-gradient-to-tr from-[#f9a03f] via-[#e8453c] to-[#c13584] p-[2.5px]">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white ring-[3px] ring-white lg:h-16 lg:w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="w-[78%] object-contain" />
              </span>
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark">Instagram · @{user}</p>
              <h2 className="font-display mt-1.5 text-2xl font-semibold leading-tight text-navy sm:text-3xl lg:text-4xl">{T.h}</h2>
              <p className="mt-1 hidden text-sm text-navy/60 sm:block">{T.p}</p>
            </div>
          </div>
          <a href={profile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f9a03f] via-[#e8453c] to-[#c13584] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-105">
            <IgIcon />
            {T.follow}
          </a>
        </div>

        <div className={`no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 lg:gap-4 sm:grid-cols-4`}>
          {shown.map((p, i) => {
            const big = mosaic && i === 0;
            const cap = short(p.caption);
            return (
              <a
                key={p.id}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={cap || "Instagram"}
                className={`group relative block aspect-[4/5] w-[66%] shrink-0 snap-start overflow-hidden rounded-2xl bg-mist shadow-sm ring-1 ring-navy/5 transition hover:shadow-lg sm:aspect-square sm:w-auto lg:rounded-3xl ${big ? "sm:col-span-2 sm:row-span-2" : ""} ${mosaic && i === 5 ? "sm:hidden" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                {(p.type === "VIDEO" || p.album) && (
                  <span className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur" aria-hidden>
                    {p.type === "VIDEO" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></svg>
                    )}
                  </span>
                )}
                {(cap || p.likes) && (
                  <span className={`absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-12 text-white transition duration-300 lg:p-4 lg:pt-14 ${big ? "" : "sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"}`}>
                    {cap && <span className={`line-clamp-2 font-medium leading-snug ${big ? "text-sm lg:text-base" : "text-[13px]"}`}>{cap}</span>}
                    {p.likes ? (
                      <span className="flex items-center gap-1 text-xs text-white/85">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        {nf.format(p.likes)}
                      </span>
                    ) : null}
                  </span>
                )}
              </a>
            );
          })}
          {/* Telefonda şeridin sonunda: profile git kartı */}
          <a href={profile} target="_blank" rel="noopener noreferrer" className="flex aspect-[4/5] w-[66%] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl bg-navy p-5 text-center text-white sm:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/25"><IgIcon s={22} /></span>
            <span className="font-display text-lg font-semibold leading-tight">{T.more}</span>
            <span className="text-sm text-white/70">@{user} →</span>
          </a>
        </div>
      </div>
    </section>
  );
}
