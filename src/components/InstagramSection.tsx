import { getPosts, getStories, igUser } from "@/lib/instagram";
import { StoryViewer } from "./StoryViewer";

// Ana sayfa: Instagram'daki güncel story'ler (yayındayken) ve son paylaşımlar. Erişim anahtarı yoksa görünmez.
export async function InstagramSection() {
  const [stories, posts] = await Promise.all([getStories(), getPosts()]);
  if (stories.length === 0 && posts.length === 0) return null;
  const user = igUser();
  return (
    <section className="py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">Instagram</p>
            <h2 className="font-display text-3xl font-medium leading-tight text-navy lg:text-5xl">{stories.length > 0 ? "Şimdi denizde" : "Son paylaşımlar"}</h2>
          </div>
          <a href={`https://www.instagram.com/${user}/`} target="_blank" rel="noopener noreferrer" className="rounded-full px-5 py-2.5 text-sm font-semibold text-navy ring-1 ring-navy/15 transition hover:ring-turquoise">@{user} →</a>
        </div>
        {stories.length > 0 && <StoryViewer items={stories} user={user} />}
        {posts.length > 0 && (
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4 ${stories.length > 0 ? "mt-8" : ""}`}>
            {posts.slice(0, 4).map((p) => (
              <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-2xl bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                {p.type === "VIDEO" && <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-xs text-white">▶</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
