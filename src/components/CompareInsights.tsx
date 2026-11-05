import type { Boat } from "@/lib/data";
import type { Point } from "@/lib/compare";
import type { Lang } from "@/lib/i18n";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";

// Ekibin notu + otomatik değerlendirme. Hem karşılaştırma sayfasında hem favorilerde kullanılır.
export function CompareInsights({ A, B, note, points, summary, lang }: { A: Boat; B: Boat; note: string; points: Point[]; summary: string; lang: Lang }) {
  const en = lang !== "tr";
  const ru = lang === "ru";
  return (
    <div className="space-y-8">
      {note && (
        <div className="rounded-3xl bg-navy p-6 text-white lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{ru ? "Мнение yatpaketi" : en ? "Our take" : "Yatpaketi'nin yorumu"}</p>
          <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-white/90">{note}</p>
        </div>
      )}
      <div>
        <p className={`mb-4 ${eyebrow}`}>{ru ? "Чем они отличаются" : en ? "How they compare" : "Nasıl ayrışıyorlar?"}</p>
        <div className="grid gap-4 md:grid-cols-2">
          {points.map((p) => (
            <article key={p.title} className="rounded-2xl bg-white p-5 ring-1 ring-navy/10">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-navy">{p.title}</h3>
                {p.win && <span className="rounded-full bg-turquoise/15 px-3 py-1 text-xs font-semibold text-turquoise-dark">{(p.win === "a" ? A : B).name}</span>}
              </div>
              <p className="mt-2 leading-relaxed text-navy/75">{p.text}</p>
            </article>
          ))}
        </div>
        <p className="mt-5 rounded-2xl bg-turquoise/10 p-5 text-navy"><b>{ru ? "Коротко: " : en ? "In short: " : "Kısaca: "}</b>{summary}</p>
      </div>
    </div>
  );
}
