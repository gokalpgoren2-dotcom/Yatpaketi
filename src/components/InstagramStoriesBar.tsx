import { getPosts, getStories, igUser } from "@/lib/instagram";
import { StoryViewer } from "./StoryViewer";

// Ana sayfa, hero'nun hemen altı: Instagram'daki gibi yuvarlak story şeridi.
// Yayında story varsa onlar; yoksa son paylaşımlar aynı dairelerde gösterilir, böylece şerit hiç boş kalmaz.
export async function InstagramStoriesBar({ lang }: { lang: "tr" | "en" | "ru" }) {
  const [stories, posts] = await Promise.all([getStories(), getPosts()]);
  const user = igUser();
  const en = lang !== "tr";
  const ru = lang === "ru";
  const live = stories.length > 0;
  const items = live ? stories : posts.slice(0, 8);
  const profile = `https://www.instagram.com/${user}/`;
  return (
    <section aria-label="Instagram" className="border-b border-navy/5 bg-gradient-to-b from-white to-mist">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8 lg:py-7">
        <div className="flex shrink-0 items-center justify-between gap-4 lg:block lg:w-60">
          <div>
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-turquoise-dark">
              {live && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" /></span>}
              Instagram
            </p>
            <p className="font-display mt-1 text-lg font-semibold leading-tight text-navy lg:text-xl">{live ? (ru ? "Прямо с моря" : en ? "Live from the sea" : "Şimdi denizde") : ru ? "Моменты с моря" : en ? "Moments from the sea" : "Denizden anlık kareler"}</p>
          </div>
          <a href={profile} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white transition hover:bg-turquoise-dark lg:mt-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
            {ru ? "Подписаться" : en ? "Follow" : "Takip et"}
          </a>
        </div>

        <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-1 sm:gap-5 lg:mx-0 lg:px-0">
          {/* Profil dairesi */}
          <a href={profile} target="_blank" rel="noopener noreferrer" className="group flex shrink-0 snap-start flex-col items-center gap-1.5" aria-label={`@${user} Instagram`}>
            <span className={`relative rounded-full p-[2.5px] transition duration-300 group-hover:scale-[1.04] ${live ? "bg-gradient-to-tr from-[#f9a03f] via-[#e8453c] to-[#c13584]" : "bg-navy/10"}`}>
              <span className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-white ring-[3px] ring-white sm:h-[84px] sm:w-[84px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="w-[78%] object-contain" />
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-turquoise text-sm font-bold leading-none text-white ring-2 ring-white" aria-hidden>+</span>
            </span>
            <span className="max-w-[84px] truncate text-[11px] font-semibold text-navy">{user}</span>
          </a>

          {items.length > 0 ? (
            <StoryViewer items={items} user={user} lang={lang} mode={live ? "story" : "post"} />
          ) : (
            // Instagram bağlı değil: boş daireler
            Array.from({ length: 6 }).map((_, i) => (
              <span key={i} aria-hidden className="flex shrink-0 flex-col items-center gap-1.5">
                <span className="rounded-full bg-navy/[0.07] p-[2.5px]">
                  <span className="block h-[72px] w-[72px] rounded-full bg-gradient-to-br from-mist to-[#e3f1f4] ring-[3px] ring-white sm:h-[84px] sm:w-[84px]" />
                </span>
                <span className="h-2 w-10 rounded-full bg-navy/[0.06]" />
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
