import fs from "node:fs";
import path from "node:path";
import type { AgentId } from "@/shared/types";
import { IntegrationRequiredError, type ExecutionAdapter, type RunContext } from "./types";

// Yerel mod: LLM yok. Her masa depo üzerinde gerçek, sabit bir denetim çalıştırır ve yalnızca
// gerçekten ölçtüğünü raporlar. Görev metni yorumlanmaz; bu, her raporun başında yazar.

const IGNORE = new Set(["node_modules", ".next", ".git", "ai-office", "out", ".vercel"]);

function walk(root: string, sub: string, exts: string[], out: string[] = []): string[] {
  const dir = path.join(root, sub);
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (IGNORE.has(e.name)) continue;
    const rel = path.join(sub, e.name);
    if (e.isDirectory()) walk(root, rel, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(rel.split(path.sep).join("/"));
  }
  return out;
}

const read = (root: string, rel: string) => {
  try {
    return fs.readFileSync(path.join(root, rel), "utf8");
  } catch {
    return "";
  }
};

const banner = (what: string) =>
  `> **Yerel mod raporu.** LLM kullanılmadı ve görev metniniz yorumlanmadı. Bu masa yerel modda şu sabit denetimi çalıştırır: ${what} Görevi serbest metinle yürütmek için \`ANTHROPIC_API_KEY\` tanımlayın.\n`;

const list = (items: string[], max = 40) =>
  items.length === 0 ? "- Yok\n" : items.slice(0, max).map((i) => `- ${i}`).join("\n") + (items.length > max ? `\n- ... ve ${items.length - max} kayıt daha` : "") + "\n";

type Analyzer = (root: string, ctx: RunContext) => string;

// ---------- Tekne verisi ----------
const yachtData: Analyzer = (root, ctx) => {
  const raw = read(root, "icerik/tekneler.json");
  if (!raw) throw new IntegrationRequiredError("icerik/tekneler.json bulunamadı; denetlenecek tekne verisi yok.");
  const data = JSON.parse(raw) as Record<string, { ad?: string; yayinla?: boolean; bilgi?: Record<string, unknown> }>;
  const slugs = Object.keys(data).filter((k) => !k.startsWith("_"));
  const ports = new Set<string>();
  try {
    const l = JSON.parse(read(root, "icerik/limanlar.json") || "{}") as Record<string, { name_tr?: string }>;
    for (const [k, v] of Object.entries(l)) if (!k.startsWith("_") && v?.name_tr) ports.add(v.name_tr.toLocaleLowerCase("tr"));
  } catch {
    /* liman listesi okunamadıysa liman eşleşmesi atlanır */
  }
  ctx.emit("tool", { tool: "Yerel denetim", summary: `icerik/tekneler.json okundu: ${slugs.length} tekne` });

  const required = ["tip", "length_m", "cabins", "guests", "crew", "home_port", "description_tr", "description_en"];
  const missing: string[] = [];
  const inconsistent: string[] = [];
  const photos: string[] = [];
  const unknownPort: string[] = [];
  const types = new Map<string, number>();
  const names = new Map<string, string[]>();

  for (const slug of slugs) {
    const rec = data[slug] ?? {};
    const b = rec.bilgi ?? {};
    const lack = required.filter((f) => b[f] === undefined || b[f] === null || b[f] === "");
    if (!rec.ad) lack.unshift("ad");
    if (lack.length) missing.push(`\`${slug}\`: ${lack.join(", ")}`);

    const tip = String(b.tip ?? "(yok)");
    types.set(tip, (types.get(tip) ?? 0) + 1);
    const key = String(rec.ad ?? slug).toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşıöç]/g, "");
    names.set(key, [...(names.get(key) ?? []), slug]);

    const cabins = Number(b.cabins);
    const guests = Number(b.guests);
    const len = Number(b.length_m);
    if (cabins > 0 && guests > 0 && (guests > cabins * 3 || guests < cabins)) inconsistent.push(`\`${slug}\`: ${cabins} kabin, ${guests} misafir (oran olağandışı)`);
    const m = /(\d+(?:[.,]\d+)?)\s*metre/i.exec(String(b.description_tr ?? ""));
    if (m && len > 0 && Math.abs(Number(m[1].replace(",", ".")) - len) > 0.5) inconsistent.push(`\`${slug}\`: alan uzunluğu ${len} m, TR açıklamada "${m[0]}"`);
    const mc = /(\d+)\s*kabin/i.exec(String(b.description_tr ?? ""));
    if (mc && cabins > 0 && Number(mc[1]) !== cabins) inconsistent.push(`\`${slug}\`: alan ${cabins} kabin, TR açıklamada "${mc[0]}"`);

    const port = String(b.home_port ?? "");
    if (port && ports.size && !ports.has(port.toLocaleLowerCase("tr"))) unknownPort.push(`\`${slug}\`: "${port}"`);

    let count = 0;
    let cover = false;
    for (const dir of [`icerik/temiz/${slug}`, `public/tekneler/${slug}`]) {
      try {
        const files = fs.readdirSync(path.join(root, dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
        if (files.length > count) {
          count = files.length;
          cover = files.some((f) => /^0?1\./.test(f));
        }
      } catch {
        /* klasör yok */
      }
    }
    if (count === 0) photos.push(`\`${slug}\`: depoda fotoğraf klasörü yok`);
    else if (count < 10) photos.push(`\`${slug}\`: ${count} fotoğraf (10'dan az)`);
    else if (!cover) photos.push(`\`${slug}\`: kapak fotoğrafı (01) yok`);
  }
  const dupes = [...names.values()].filter((v) => v.length > 1).map((v) => v.map((s) => `\`${s}\``).join(" ve "));

  return (
    banner("`icerik/tekneler.json` için zorunlu alan, tutarlılık, kopya ve fotoğraf kontrolü.") +
    `\n## Özet\n\n${slugs.length} tekne incelendi. Eksik alan: ${missing.length}, tutarsızlık: ${inconsistent.length}, fotoğraf uyarısı: ${photos.length}, kopya ad: ${dupes.length}, listede olmayan liman: ${unknownPort.length}.\n\n` +
    `Tip dağılımı: ${[...types].map(([t, n]) => `${t} ${n}`).join(", ")}.\n\n` +
    `## Bulgular\n\n### Eksik zorunlu alanlar\n${list(missing)}\n### Tutarsızlıklar\n${list(inconsistent)}\n### Fotoğraflar\n${list(photos)}\n### Kopya adlar\n${list(dupes)}\n### limanlar.json ile eşleşmeyen bağlama limanı\n${list(unknownPort)}\n` +
    `## Kapsam dışı\n\nBu rapor depodaki dosyaları yansıtır. Canlı veritabanındaki (Supabase) ilanlar ve yönetim panelinden yapılan değişiklikler incelenmedi.\n`
  );
};

// ---------- SEO ----------
const seo: Analyzer = (root, ctx) => {
  const pages = walk(root, "src/app", ["page.tsx"]).filter((p) => !/\/(admin|musteri|api)\//.test(p));
  ctx.emit("tool", { tool: "Yerel denetim", summary: `${pages.length} herkese açık sayfa dosyası tarandı` });
  const noMeta: string[] = [];
  const noCanonical: string[] = [];
  const noLanguages: string[] = [];
  let jsonLd = 0;
  for (const p of pages) {
    const s = read(root, p);
    const hasMeta = /export\s+(const\s+metadata|(async\s+)?function\s+generateMetadata)/.test(s);
    if (!hasMeta) {
      noMeta.push(`\`${p}\``);
      continue;
    }
    if (!/canonical/.test(s)) noCanonical.push(`\`${p}\``);
    if (!/languages\s*:/.test(s) && !/hreflang/i.test(s)) noLanguages.push(`\`${p}\``);
    if (/application\/ld\+json/.test(s)) jsonLd += 1;
  }
  const lang = (pre: string) => pages.filter((p) => p.startsWith(`src/app/${pre}/`)).length;
  const en = lang("en");
  const ru = lang("ru");
  const hasSitemap = fs.existsSync(path.join(root, "src/app/sitemap.ts"));
  const hasRobots = fs.existsSync(path.join(root, "src/app/robots.ts"));
  return (
    banner("`src/app` altındaki herkese açık sayfalarda metadata, canonical, hreflang ve JSON-LD varlık kontrolü.") +
    `\n## Özet\n\n${pages.length} sayfa dosyası tarandı (TR ${pages.length - en - ru}, EN ${en}, RU ${ru}). Metadata tanımı olmayan: ${noMeta.length}. Canonical geçmeyen: ${noCanonical.length}. Dil alternatifi (hreflang) geçmeyen: ${noLanguages.length}. Sayfa dosyasında JSON-LD bulunan: ${jsonLd}.\n\n` +
    `- \`sitemap.ts\`: ${hasSitemap ? "var" : "YOK"}\n- \`robots.ts\`: ${hasRobots ? "var" : "YOK"}\n\n` +
    `## Bulgular\n\n### Metadata tanımı olmayan sayfalar\n${list(noMeta)}\n### Canonical içermeyen sayfalar\n${list(noCanonical)}\n### Dil alternatifi içermeyen sayfalar\n${list(noLanguages)}\n` +
    `## Kapsam dışı\n\nKontrol yalnızca sayfa dosyasının kendi metnine bakar: metadata, paylaşılan bir yardımcı fonksiyonda ya da \`layout.tsx\` içinde üretiliyorsa burada "yok" görünebilir. Arama hacmi, sıralama ve canlı sayfa çıktısı ölçülmedi.\n`
  );
};

// ---------- Güvenlik ve QA ----------
const security: Analyzer = (root, ctx) => {
  const files = [...walk(root, "src", [".ts", ".tsx"]), ...walk(root, "scripts", [".mjs", ".js", ".ts"])];
  ctx.emit("tool", { tool: "Yerel denetim", summary: `${files.length} kaynak dosya tarandı` });
  const secretPatterns: [string, RegExp][] = [
    ["Anthropic/OpenAI tarzı anahtar", /\bsk-[A-Za-z0-9_-]{24,}/],
    ["JWT (Supabase anahtarı olabilir)", /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/],
    ["AWS erişim anahtarı", /\bAKIA[0-9A-Z]{16}\b/],
    ["Özel anahtar bloğu", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ];
  const secrets: string[] = [];
  const clientLeaks: string[] = [];
  const publicEnv: string[] = [];
  const html: string[] = [];
  const evals: string[] = [];
  const actionsNoAuth: string[] = [];
  for (const f of files) {
    const s = read(root, f);
    const lines = s.split("\n");
    lines.forEach((line, i) => {
      for (const [name, re] of secretPatterns) if (re.test(line)) secrets.push(`\`${f}:${i + 1}\` ${name} (değer rapora yazılmadı)`);
      if (/dangerouslySetInnerHTML/.test(line)) html.push(`\`${f}:${i + 1}\``);
      if (/\beval\s*\(|new Function\s*\(/.test(line)) evals.push(`\`${f}:${i + 1}\``);
      const m = /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE|PRIVATE|PASSWORD|TOKEN)[A-Z0-9_]*/.exec(line);
      if (m) publicEnv.push(`\`${f}:${i + 1}\` ${m[0]}`);
    });
    const isClient = /^\s*["']use client["']/m.test(s.slice(0, 200));
    if (isClient && /SERVICE_ROLE/.test(s)) clientLeaks.push(`\`${f}\``);
    if (/^\s*["']use server["']/m.test(s.slice(0, 200)) && /\/admin\//.test(f) && !/login/.test(f) && !/getUser|requireAdmin|isAdmin|auth\(/.test(s)) actionsNoAuth.push(`\`${f}\``);
  }
  const gi = read(root, ".gitignore");
  const envIgnored = /^\.env(\.\*)?$/m.test(gi);
  const tracked = ["", ".local", ".production", ".development"].map((x) => `.env${x}`).filter((f) => fs.existsSync(path.join(root, f)));
  return (
    banner("kaynak kodda gizli anahtar deseni, istemciye sızan sunucu anahtarı, `dangerouslySetInnerHTML`, `eval` ve yetki kontrolü görünmeyen yönetim eylemi taraması.") +
    `\n## Özet\n\n${files.length} dosya tarandı. Gizli anahtar deseni: ${secrets.length}. İstemci bileşeninde service role: ${clientLeaks.length}. Şüpheli NEXT_PUBLIC değişkeni: ${publicEnv.length}. dangerouslySetInnerHTML: ${html.length}. eval: ${evals.length}. Yetki kontrolü görünmeyen yönetim eylem dosyası: ${actionsNoAuth.length}.\n\n` +
    `- \`.gitignore\` içinde \`.env\`: ${envIgnored ? "var" : "YOK (kritik)"}\n- Çalışma klasöründe ortam dosyası: ${tracked.length ? tracked.join(", ") + " (içeriği okunmadı)" : "yok"}\n\n` +
    `## Bulgular\n\n### Gizli anahtar desenleri (kritik)\n${list(secrets)}\n### İstemci bileşeninde service role kullanımı (kritik)\n${list(clientLeaks)}\n### Adı gizli veri çağrıştıran NEXT_PUBLIC değişkenleri (yüksek)\n${list(publicEnv)}\n### Yetki kontrolü görünmeyen yönetim eylem dosyaları (şüphe, elle doğrulanmalı)\n${list(actionsNoAuth)}\n### dangerouslySetInnerHTML kullanımları (orta, içerik kaynağı doğrulanmalı)\n${list(html)}\n### eval / new Function (orta)\n${list(evals)}\n` +
    `## Kapsam dışı\n\nBu bir desen taramasıdır, sızma testi değildir. Lint, tip kontrolü, build, bağımlılık açıkları (\`npm audit\`) ve Supabase RLS politikalarının canlı durumu yerel modda çalıştırılmadı. Yetki kontrolü middleware ya da paylaşılan yardımcıda yapılıyorsa "şüphe" listesindeki dosyalar temiz olabilir.\n`
  );
};

// ---------- Frontend ----------
const frontend: Analyzer = (root, ctx) => {
  const files = walk(root, "src", [".tsx"]);
  ctx.emit("tool", { tool: "Yerel denetim", summary: `${files.length} .tsx dosyası tarandı` });
  let client = 0;
  const imgNoAlt: string[] = [];
  for (const f of files) {
    const s = read(root, f);
    if (/^\s*["']use client["']/m.test(s.slice(0, 200))) client += 1;
    const re = /<(img|Image)\b([^>]*)>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) if (!/\balt\s*=/.test(m[2]) && !/\{\.\.\./.test(m[2])) imgNoAlt.push(`\`${f}:${s.slice(0, m.index).split("\n").length}\` <${m[1]}>`);
  }
  const pages = walk(root, "src/app", ["page.tsx"]).filter((p) => !/\/(admin|musteri)\//.test(p));
  const route = (p: string) => p.replace(/^src\/app\//, "").replace(/\/?page\.tsx$/, "");
  const tr = pages.map(route).filter((r) => !/^(en|ru)(\/|$)/.test(r));
  const has = (pre: string) => new Set(pages.map(route).filter((r) => r === pre || r.startsWith(`${pre}/`)).map((r) => r.slice(pre.length + 1)));
  const en = has("en");
  const ru = has("ru");
  const noEn = tr.filter((r) => !en.has(r)).map((r) => `\`/${r}\``);
  const noRu = tr.filter((r) => !ru.has(r)).map((r) => `\`/${r}\``);
  const comps = files.filter((f) => f.startsWith("src/components/")).length;
  return (
    banner("`.tsx` dosyalarında bileşen envanteri, `alt` özelliği olmayan görseller ve TR, EN, RU sayfa eşleşmesi.") +
    `\n## Özet\n\n${files.length} .tsx dosyası, ${comps} bileşen dosyası. İstemci bileşeni ("use client"): ${client}. \`alt\` yazılmamış görsel etiketi: ${imgNoAlt.length}. TR sayfası olup EN karşılığı olmayan: ${noEn.length}, RU karşılığı olmayan: ${noRu.length}.\n\n` +
    `## Bulgular\n\n### alt özelliği olmayan görseller\n${list(imgNoAlt)}\n### EN karşılığı olmayan TR sayfaları\n${list(noEn)}\n### RU karşılığı olmayan TR sayfaları\n${list(noRu)}\n` +
    `## Kapsam dışı\n\nGörsel tasarım, mobil görünüm, kontrast ve performans ölçülmedi; bunlar için tarayıcı ve gerçek mod gerekir. Çok satırlı etiketlerde \`alt\` tespiti yanılabilir.\n`
  );
};

// ---------- Backend ----------
const backend: Analyzer = (root, ctx) => {
  const sqlFiles = walk(root, "supabase", [".sql"]);
  const tables = new Set<string>();
  const rls = new Set<string>();
  for (const f of sqlFiles) {
    const s = read(root, f);
    for (const m of s.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?/gi)) tables.add(m[1].toLowerCase());
    for (const m of s.matchAll(/alter\s+table\s+(?:if\s+exists\s+)?(?:public\.)?"?([a-z_][a-z0-9_]*)"?\s+enable\s+row\s+level\s+security/gi)) rls.add(m[1].toLowerCase());
  }
  const src = walk(root, "src", [".ts", ".tsx"]);
  ctx.emit("tool", { tool: "Yerel denetim", summary: `${sqlFiles.length} SQL ve ${src.length} kaynak dosya tarandı` });
  const actions: string[] = [];
  const env = new Set<string>();
  for (const f of src) {
    const s = read(root, f);
    for (const m of s.matchAll(/process\.env\.([A-Z0-9_]+)/g)) env.add(m[1]);
    if (/^\s*["']use server["']/m.test(s.slice(0, 200))) actions.push(`\`${f}\`: ${(s.match(/export\s+async\s+function\s+\w+/g) ?? []).length} dışa açık eylem`);
  }
  const routes = walk(root, "src/app", ["route.ts"]).map((r) => `\`${r}\``);
  const noRls = [...tables].filter((t) => !rls.has(t)).map((t) => `\`${t}\``);
  return (
    banner("`supabase/*.sql` tablo ve RLS envanteri, sunucu eylemleri, route handler'lar ve kullanılan ortam değişkeni adları.") +
    `\n## Özet\n\n${sqlFiles.length} SQL dosyasında ${tables.size} tablo tanımı bulundu; ${noRls.length} tablo için bu dosyalarda RLS açma satırı yok. ${actions.length} sunucu eylem dosyası, ${routes.length} route handler, ${env.size} ortam değişkeni adı.\n\n` +
    `## Bulgular\n\n### Tablolar\n${list([...tables].sort().map((t) => `\`${t}\`${rls.has(t) ? " (RLS açık)" : ""}`), 80)}\n### SQL dosyalarında RLS açma satırı görünmeyen tablolar (elle doğrulanmalı)\n${list(noRls, 80)}\n### Sunucu eylem dosyaları\n${list(actions)}\n### Route handler'lar\n${list(routes)}\n### Kodda geçen ortam değişkeni adları\n${list([...env].sort().map((e) => `\`${e}\``), 60)}\n` +
    `## Kapsam dışı\n\nCanlı veritabanına bağlanılmadı: tabloların ve RLS politikalarının gerçek durumu SQL dosyalarından farklı olabilir. Ortam değişkenlerinin değerleri okunmadı.\n`
  );
};

const ANALYZERS: Partial<Record<AgentId, Analyzer>> = {
  "yacht-data-agent": yachtData,
  "seo-agent": seo,
  "security-qa-agent": security,
  "frontend-agent": frontend,
  "backend-agent": backend,
};

const ROUTES: [AgentId, RegExp][] = [
  ["yacht-data-agent", /tekne|ilan|fotoğraf|portföy|veri kalite/],
  ["seo-agent", /seo|metadata|anahtar kelime|sitemap|hreflang|canonical/],
  ["security-qa-agent", /güvenlik|sızıntı|açık|test|lint|qa|kalite güvence/],
  ["frontend-agent", /arayüz|frontend|ui|bileşen|mobil|alt met|tasarım/],
  ["backend-agent", /backend|api|veritabanı|supabase|sunucu|tablo/],
  ["competitor-agent", /rakip|ece yachting|ada yacht|luna yat|yacht dünyası/],
  ["meta-agent", /instagram|facebook|meta|reklam|sosyal medya/],
];

/** Yerel modda yönetici: anahtar kelime eşleşmesiyle yönlendirir (dil modeli yok). */
export function routeLocally(prompt: string): AgentId[] {
  const p = prompt.toLocaleLowerCase("tr");
  return ROUTES.filter(([, re]) => re.test(p)).map(([id]) => id);
}

async function master(ctx: RunContext): Promise<string> {
  const targets = routeLocally(ctx.job.prompt);
  if (!targets.length)
    throw new IntegrationRequiredError(
      "Yerel modda görev metni yorumlanamaz: yönlendirme yalnızca anahtar kelime eşleşmesiyle yapılır ve bu görevde eşleşme bulunamadı. Tanınan konular: tekne/ilan, SEO, güvenlik/test, arayüz, backend/veritabanı, rakip, Meta/reklam.",
    );
  const parts: string[] = [];
  for (const t of targets) {
    if (ctx.signal.aborted) break;
    const r = await ctx.delegate(t, ctx.job.prompt);
    parts.push(`## ${t}\n\nDurum: **${r.status}** (alt görev \`${r.jobId.slice(0, 8)}\`)\n\n${r.report ? r.report.replace(/^#/gm, "##") : `Rapor yok. ${r.error ?? ""}`}`);
  }
  return (
    banner("görev metnini anahtar kelimelerle uzman masalara yönlendirme ve dönen raporları alt alta birleştirme. Yorum ya da özetleme yapılmaz.") +
    `\n## Yönlendirme\n\n${targets.map((t) => `- ${t}`).join("\n")}\n\n${parts.join("\n\n---\n\n")}\n`
  );
}

export const localAdapter: ExecutionAdapter = {
  async run(ctx) {
    const started = Date.now();
    const id = ctx.job.agentId;
    let report: string;
    if (id === "master-agent") report = await master(ctx);
    else if (id === "competitor-agent")
      throw new IntegrationRequiredError("Rakip analizi web araması ve sayfa okuma gerektirir; yerel modda yapılamaz. ANTHROPIC_API_KEY tanımlayıp gerçek modda çalıştırın.");
    else if (id === "meta-agent")
      throw new IntegrationRequiredError("İçerik takvimi ve reklam stratejisi dil modeli, performans verisi ise yetkili Meta API bağlantısı gerektirir; yerel modda üretilemez.");
    else {
      const analyzer = ANALYZERS[id];
      if (!analyzer) throw new IntegrationRequiredError(`${id} için yerel denetim tanımlı değil.`);
      report = analyzer(ctx.config.workspace, ctx);
    }
    if (ctx.signal.aborted) throw new Error("İptal edildi.");
    return { report, usage: { inputTokens: 0, outputTokens: 0, costUsd: 0, turns: 0, durationMs: Date.now() - started } };
  },
};
