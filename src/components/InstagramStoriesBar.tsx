import { getStories, igUser } from "@/lib/instagram";
import { StoryViewer } from "./StoryViewer";

// Ana sayfa, hero'nun hemen altı: Instagram'daki gibi yuvarlak story şeridi.
// Instagram bağlı değilken ya da yayında story yokken daireler boş görünür.
export async function InstagramStoriesBar({ lang }: { lang: "tr" | "en" | "ru" }) {
  const stories = await getStories();
  const user = igUser();
  const en = lang !== "tr";
  const ru = lang === "ru";
  const live = stories.length > 0;
  const profile = `https://www.instagram.com/${user}/`;
  return (
    <section aria-label="Instagram" className="border-b border-navy/5 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        <div className="flex shrink-0 items-center justify-between gap-4 lg:block lg:w-56">
          <div>
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-turquoise-dark">
              {live && <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" /></span>}
              Instagram
            </p>
            <p className="font-display mt-1 text-lg font-semibold leading-tight text-navy">{live ? (ru ? "Прямо с моря" : en ? "Live from the sea" : "Şimdi denizde") : ru ? "Моменты с моря" : en ? "Moments from the sea" : "Denizden anlık kareler"}</p>
          </div>
          <a href={profile} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-navy ring-1 ring-navy/15 transition hover:ring-turquoise lg:mt-3 lg:inline-block">
            {ru ? "Подписаться" : en ? "Follow" : "Takip et"} @{user}
          </a>
        </div>

        <div className="no-scrollbar -mx-5 flex gap-4 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0">
          {/* Profil dairesi */}
          <a href={profile} target="_blank" rel="noopener noreferrer" className="flex shrink-0 flex-col items-center gap-1.5" aria-label={`@${user} Instagram`}>
            <span className={`rounded-full p-[2.5px] ${live ? "bg-gradient-to-tr from-[#f9a03f] via-[#e8453c] to-[#c13584]" : "bg-navy/10"}`}>
              <span className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full bg-white ring-[3px] ring-white sm:h-[76px] sm:w-[76px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" className="w-[78%] object-contain" />
              </span>
            </span>
            <span className="max-w-[80px] truncate text-[11px] font-medium text-navy/70">{user}</span>
          </a>

          {live ? (
            <StoryViewer items={stories} user={user} variant="circles" />
          ) : (
            // Henüz story yok: boş daireler
            Array.from({ length: 7 }).map((_, i) => (
              <span key={i} aria-hidden className="flex shrink-0 flex-col items-center gap-1.5">
                <span className="rounded-full border-2 border-dashed border-navy/15 p-[2px]">
                  <span className="block h-[66px] w-[66px] rounded-full bg-gradient-to-br from-mist to-[#e9f3f6] sm:h-[74px] sm:w-[74px]" />
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
