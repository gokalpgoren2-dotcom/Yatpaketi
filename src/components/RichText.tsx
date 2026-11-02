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
    return (
      <div className="space-y-6 text-[1.075rem] leading-[1.85] text-navy/75 lg:text-lg lg:leading-[1.9]">
        {blocks.map((b, i) => {
          if (b.startsWith("### ")) return <h3 key={i} id={headingId(b.slice(4))} className="font-display scroll-mt-28 pt-2 text-xl font-semibold text-navy lg:text-2xl">{b.slice(4)}</h3>;
          if (b.startsWith("## ")) {
            const t = b.slice(3).trim();
            return (
              <h2 key={i} id={headingId(t)} className="font-display flex scroll-mt-28 items-center gap-3 pt-6 text-2xl font-semibold leading-tight text-navy lg:text-3xl">
                <span className="h-7 w-1.5 shrink-0 rounded-full bg-turquoise" aria-hidden />{t}
              </h2>
            );
          }
          const lines = b.split("\n");
          if (lines.every((l) => l.trim().startsWith("- "))) {
            return (
              <ul key={i} className="space-y-3 rounded-3xl bg-mist p-5 lg:p-7">
                {lines.map((l, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-turquoise text-white" aria-hidden>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                    </span>
                    <span><Inline text={l.trim().slice(2)} /></span>
                  </li>
                ))}
              </ul>
            );
          }
          if (firstP) {
            firstP = false;
            return <p key={i} className="whitespace-pre-line text-xl leading-relaxed text-navy/85 lg:text-[1.4rem] lg:leading-relaxed"><Inline text={b} /></p>;
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
