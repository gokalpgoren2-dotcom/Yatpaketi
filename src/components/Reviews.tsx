import type { Rating, Review } from "@/lib/reviews";
import type { Lang } from "@/lib/i18n";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <span key={n} className="relative inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0 text-navy/15" fill="currentColor" aria-hidden><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" /></svg>
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 24 24" width={size} height={size} className="text-[#f5a623]" fill="currentColor" aria-hidden><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" /></svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function RatingLine({ rating, lang = "tr", className = "" }: { rating: Rating; lang?: Lang; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
      <Stars value={rating.avg} size={15} />
      <b className="text-navy">{rating.avg.toFixed(1)}</b>
      <span className="text-navy/55">({rating.count} {lang === "en" ? (rating.count === 1 ? "review" : "reviews") : "yorum"})</span>
    </span>
  );
}

function when(label: string | null, lang: Lang) {
  if (!label || !/^\d{4}-\d{2}$/.test(label)) return "";
  const [y, m] = label.split("-").map(Number);
  return new Date(y, m - 1, 15).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR", { month: "long", year: "numeric" });
}

export function ReviewSection({ reviews, lang = "tr", title, showBoat = false, id }: { reviews: Review[]; lang?: Lang; title?: string; showBoat?: boolean; id?: string }) {
  if (reviews.length === 0) return null;
  const en = lang === "en";
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  return (
    <section id={id} className="mt-16 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl text-navy lg:text-3xl">{title ?? (en ? "Guest reviews" : "Misafir yorumları")}</h2>
        <RatingLine rating={{ avg, count: reviews.length }} lang={lang} />
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.id} className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-navy/10">
            <Stars value={r.rating} />
            <blockquote className="mt-3 flex-1 whitespace-pre-line leading-relaxed text-navy/80">“{r.body}”</blockquote>
            {r.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <a href={r.photo} target="_blank" rel="noopener noreferrer" className="mt-4 block overflow-hidden rounded-2xl">
                <img src={r.photo} alt={en ? `Photo from ${r.author}` : `${r.author} fotoğrafı`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </a>
            )}
            <figcaption className="mt-4 border-t border-navy/10 pt-3 text-sm">
              <b className="text-navy">{r.author}</b>
              <span className="block text-navy/55">{[showBoat ? r.boatName : "", when(r.tourLabel, lang)].filter(Boolean).join(" · ")}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
