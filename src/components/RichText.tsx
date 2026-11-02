import Link from "next/link";

// Basit yazı biçimi (HTML kullanılmaz, bu yüzden güvenlidir):
//   ## Başlık     ### Alt başlık     - madde     **kalın**     [yazı](/adres) veya [yazı](https://...)
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:\/|https:\/\/)[^)\s]+\))/g;

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-navy">{part.slice(2, -2)}</strong>;
        const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) {
          const cls = "font-medium text-turquoise-dark underline underline-offset-4";
          return m[2].startsWith("/") ? <Link key={i} href={m[2]} className={cls}>{m[1]}</Link> : <a key={i} href={m[2]} target="_blank" rel="noopener" className={cls}>{m[1]}</a>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Başlıklardan sayfa içi bağlantı adresi üretir (içindekiler için).
export function headingId(t: string) {
  return t.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function headingsOf(text: string) {
  return text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter((b) => b.startsWith("## ")).map((b) => { const t = b.slice(3).trim(); return { t, id: headingId(t) }; });
}

export function RichText({ text, article = false }: { text: string; article?: boolean }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  if (article) {
    let firstP = true;
    let h2n = 0;
    return (
      <div className="space-y-6 text-[1.06rem] font-light leading-[1.9] text-[#3d5470] lg:text-[1.125rem] [&_strong]:font-semibold [&_strong]:text-navy">
        {blocks.map((b, i) => {
          if (b.startsWith("### ")) return <h3 key={i} id={headingId(b.slice(4))} className="scroll-mt-28 pt-2 text-xl font-semibold text-navy lg:text-[1.35rem]">{b.slice(4)}</h3>;
          if (b.startsWith("## ")) {
            const t = b.slice(3).trim();
            h2n++;
            return (
              <h2 key={i} id={headingId(t)} className="scroll-mt-28 pt-8">
                <span className="block text-xs font-semibold tracking-[0.3em] text-turquoise-dark">{String(h2n).padStart(2, "0")}</span>
                <span className="font-display mt-2 block text-[1.65rem] leading-tight text-navy lg:text-[2rem]">{t}</span>
              </h2>
            );
          }
          const lines = b.split("\n");
          if (lines.every((l) => l.trim().startsWith("- "))) {
            return (
              <ul key={i} className="space-y-3 border-l-2 border-turquoise/30 pl-5">
                {lines.map((l, j) => (
                  <li key={j} className="relative">
                    <span className="absolute -left-[1.6rem] top-[0.85em] h-2 w-2 -translate-y-1/2 rounded-full bg-turquoise ring-4 ring-white" aria-hidden />
                    <Inline text={l.trim().slice(2)} />
                  </li>
                ))}
              </ul>
            );
          }
          if (firstP) {
            firstP = false;
            return <p key={i} className="whitespace-pre-line text-[1.25rem] leading-[1.75] text-[#2c4562] first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:font-display first-letter:text-[3.6rem] first-letter:leading-[0.85] first-letter:text-turquoise-dark lg:text-[1.375rem]"><Inline text={b} /></p>;
          }
          return <p key={i} className="whitespace-pre-line"><Inline text={b} /></p>;
        })}
      </div>
    );
  }
  return (
    <div className="space-y-5 text-base leading-relaxed text-navy/80 lg:text-lg">
      {blocks.map((b, i) => {
        if (b.startsWith("### ")) return <h3 key={i} className="font-display pt-2 text-xl text-navy lg:text-2xl">{b.slice(4)}</h3>;
        if (b.startsWith("## ")) return <h2 key={i} className="font-display pt-4 text-2xl text-navy lg:text-3xl">{b.slice(3)}</h2>;
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-6 marker:text-turquoise">
              {lines.map((l, j) => <li key={j}><Inline text={l.trim().slice(2)} /></li>)}
            </ul>
          );
        }
        return <p key={i} className="whitespace-pre-line"><Inline text={b} /></p>;
      })}
    </div>
  );
}
