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

export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
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
