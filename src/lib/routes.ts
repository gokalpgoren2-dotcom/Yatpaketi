// Klasik rotaların ek bilgileri (kalkış/varış, günlük durak adları). Gün açıklamaları panelde yazılan metinden okunur.
import type { Post } from "./posts";
import { href, type Lang } from "./i18n";

// days: panelde yazılan gün metinleri yerine kullanılacak gün gün program (Türkçe ve İngilizce).
type Meta = { from: string; to: string; port: string; stops: string[]; greek?: boolean; days?: { tr: string[]; en: string[] } };

const META: Record<string, Meta> = {
  "gocek-korfezi-12-adalar": {
    from: "Göcek", to: "Göcek", port: "gocek",
    stops: ["Göcek", "Yassıcalar / Zeytin Adası", "Akvaryum Koyu", "Binlik Koyu", "Hamam Koyu", "Bedri Rahmi", "Boynuzbükü"],
    days: {
      tr: [
        "Göcek'te karşılama, kabinlere yerleşme ve kumanya; ilk akşam sakin bir koyda.",
        "Birbirine yakın adacıklar arasında sığ, turkuaz sularda yüzme ve şnorkel molaları.",
        "Adını berrak suyundan alan koyda, dipteki kumu ve balıkları görebileceğiniz bir yüzme günü.",
        "Çamlarla çevrili sakin bir koyda dinlenme ve uzun bir öğle molası.",
        "Kıyıdaki, kısmen denizin içinde kalan eski hamam kalıntılarının yanında yüzme ve kısa bir yürüyüş.",
        "Ressam Bedri Rahmi Eyüboğlu'nun adını taşıyan koyda, kayadaki balık resmini arayın; akşam demirlemesi için de çok sevilir.",
        "Ormanın denize uzandığı derin ve sakin koyda son gün; ardından Göcek'e dönüş ve teslim.",
      ],
      en: [
        "Welcome in Göcek, settling into the cabins and provisioning; first evening in a quiet cove.",
        "Swimming and snorkelling stops in shallow turquoise water among the small islands.",
        "A day of swimming in the cove named for its clear water, where you can see the sandy bottom and the fish.",
        "Relaxing and a long lunch break in a calm, pine-fringed cove.",
        "Swimming and a short walk beside the old bath ruins on the shore, partly under the sea.",
        "In the cove named after the painter Bedri Rahmi Eyüboğlu, look for the fish painted on the rock; a favourite evening anchorage.",
        "Last day in the deep, calm cove where the forest meets the sea; then back to Göcek for hand-over.",
      ],
    },
  },
  "gocek-fethiye-korfezi": {
    from: "Göcek", to: "Göcek", port: "gocek",
    stops: ["Göcek", "Tersane Adası", "Kızılada", "Turunç Pınarı", "Gemiler Adası", "Katrancı Adası", "Göcek Adası"],
    days: {
      tr: [
        "Göcek'te karşılama, kabinlere yerleşme ve kumanya; ilk akşam sakin bir koyda.",
        "Eski tersane kalıntılarıyla bilinen adada yüzme ve kıyıda kısa bir yürüyüş.",
        "Fethiye körfezinin girişindeki deniz feneriyle bilinen adada, berrak suda yüzme ve şnorkel.",
        "Yalnızca denizden ulaşılan, kayalardan tatlı su süzülen serin koyda dinlenme günü.",
        "Bizans dönemi kilise ve yapı kalıntılarıyla dolu adada gün batımı yürüyüşü ve yüzme.",
        "Çamlarla çevrili sakin koyda uzun bir yüzme molası ve keyifli bir akşam.",
        "Göcek'in hemen önündeki adada son yüzme; ardından Göcek'e dönüş ve teslim.",
      ],
      en: [
        "Welcome in Göcek, settling into the cabins and provisioning; first evening in a quiet cove.",
        "Swimming and a short walk ashore on the island known for its old shipyard ruins.",
        "Swimming and snorkelling in clear water at the lighthouse island at the mouth of Fethiye Bay.",
        "A day of rest in the cool cove reachable only by sea, where fresh water trickles from the rocks.",
        "A sunset walk and swim on the island full of Byzantine church and building ruins.",
        "A long swimming break and a relaxed evening in a calm, pine-fringed cove.",
        "A last swim at the island just off Göcek; then back to Göcek for hand-over.",
      ],
    },
  },
  "fethiye-kekova": { from: "Fethiye", to: "Kekova", port: "fethiye", stops: ["Fethiye", "Ölüdeniz", "Seyir günü", "Kalkan & Kaş", "Meis", "Kekova", "Kekova"] },
  "fethiye-bozburun": { from: "Fethiye", to: "Bozburun", port: "fethiye", stops: ["Fethiye", "Ölüdeniz", "Seyir günü", "Ekincik", "Marmaris", "Orhaniye", "Bozburun"] },
  "kekova-bodrum": { from: "Kekova", to: "Bodrum", port: "kas", stops: ["Kekova", "Kalkan & Kaş", "Seyir günü", "Tersane Adası", "Seyir günü", "Knidos", "Bodrum"] },
  "marmaris-ekincik-fethiye": { from: "Marmaris", to: "Fethiye", port: "marmaris", stops: ["Marmaris", "Orhaniye", "Ekincik", "Dalyan", "Seyir günü", "Yassıcalar", "Fethiye"] },
  "marmaris-hisaronu-korfezi": { from: "Marmaris", to: "Marmaris", port: "marmaris", stops: ["Marmaris", "Orhaniye", "Selimiye", "Sömbeki", "Söğüt", "Serbest gün", "Marmaris"] },
  "bozburun-bodrum": { from: "Bozburun", to: "Bodrum", port: "bozburun", stops: ["Bozburun", "Sömbeki", "Datça", "Knidos", "Gökova", "Karaada", "Bodrum"] },
  "bozburun-hisaronu-korfezi": { from: "Bozburun", to: "Bozburun", port: "bozburun", stops: ["Bozburun", "Sömbeki", "Selimiye", "Söğüt", "Orhaniye", "Serbest gün", "Bozburun"] },
  "bodrum-datca-hisaronu-korfezi": { from: "Bodrum", to: "Hisarönü", port: "bodrum", stops: ["Bodrum", "Karaada", "Datça", "Knidos", "Orhaniye", "Selimiye", "Hisarönü"] },
  "bodrum-yunan-adalari": { from: "Bodrum", to: "Bodrum", port: "bodrum", greek: true, stops: ["Bodrum", "Karaada", "Kos", "Kos", "Dönüş", "Gümüşlük", "Bodrum"] },
  "marmaris-yunan-adalari": { from: "Marmaris", to: "Marmaris", port: "marmaris", greek: true, stops: ["Marmaris", "Orhaniye", "Rodos", "Rodos", "Symi", "Dönüş", "Marmaris"] },
  "datca-yunan-adalari": { from: "Datça", to: "Datça", port: "datca", greek: true, stops: ["Datça", "Knidos", "Symi", "Rodos", "Rodos", "Dönüş", "Datça"] },
  "bodrum-yarimadasi": { from: "Bodrum", to: "Bodrum", port: "bodrum", stops: ["Bodrum", "Karaada", "Gümüşlük", "Serbest gün", "Yalıkavak", "Serbest gün", "Bodrum"] },
  "bodrum-gokova-korfezi-rotasi": { from: "Bodrum", to: "Bodrum", port: "bodrum", stops: ["Bodrum", "Karaada", "Gökova", "Sedir Adası", "Akyaka", "Serbest gün", "Bodrum"] },
  "bodrum-gocek": { from: "Bodrum", to: "Göcek", port: "bodrum", stops: ["Bodrum", "Knidos", "Datça", "Marmaris", "Ekincik", "Tersane Adası", "Göcek"] },
};

const EN_NAMES: Record<string, string> = {
  "Yassıcalar / Zeytin Adası": "Yassıca / Zeytin Island", "Akvaryum Koyu": "Aquarium Bay", "Hamam Koyu": "Hamam Bay", "Turunç Pınarı": "Turunc Pinari", "Katrancı Adası": "Katranci Island", "Göcek Adası": "Gocek Island", "Kızılada": "Kizilada",
  "Seyir günü": "Sailing day", "Serbest gün": "Free day", "Dönüş": "Return", "Tersane Adası": "Tersane Island", "Gemiler Adası": "Gemiler Island",
  "Sedir Adası": "Sedir Island", "12 Adalar": "12 Islands", "Rodos": "Rhodes", "Meis": "Kastellorizo",
};
const GENERIC = new Set(["Seyir günü", "Serbest gün", "Dönüş"]);
const nm = (s: string, lang: Lang) => (lang === "en" ? EN_NAMES[s] ?? s : s);

// Bulunma eki düzeltmesi: "Bodrum'te" → "Bodrum'da", "Fethiye'te" → "Fethiye'de".
function fixTr(t: string) {
  return t.replace(/([A-Za-zÇĞİÖŞÜçğıöşü]+)'(te|ta|de|da)\b/g, (_, w: string) => {
    const v = [...w.toLowerCase()].reverse().find((c) => "aeıioöuü".includes(c)) ?? "e";
    const back = "aıou".includes(v);
    const hard = "fstkçşhp".includes(w.slice(-1).toLowerCase());
    return `${w}'${hard ? "t" : "d"}${back ? "a" : "e"}`;
  });
}

export type Activity = "swim" | "snorkel" | "walk" | "dinner" | "sunset" | "history" | "market" | "sail" | "passport" | "beach" | "relax";
const ACT: [Activity, RegExp][] = [
  ["swim", /yüzme|swim/i], ["snorkel", /şnorkel|dalış|snorkel|div/i], ["walk", /yürüyüş|walk/i], ["dinner", /yemeğ|yemek|balık|dinner|fish|meal/i],
  ["sunset", /gün batımı|sunset/i], ["history", /antik|batık|kale|tarih|ancient|sunken|castle|ruins|old town|eski şehir/i], ["market", /çarşı|pazar|market|bazaar/i],
  ["sail", /seyir|uzun etap|sailing|long leg/i], ["passport", /belge|giriş|document|formalit/i], ["beach", /plaj|kumsal|beach/i], ["relax", /dinlenme|serbest|sakin|relax|free day|calm|quiet/i],
];

export type RouteDay = { n: number; title: string; text: string; acts: Activity[] };
export type RouteInfo = {
  from: string; to: string; loop: boolean; greek: boolean; port: string | null;
  days: RouteDay[]; chart: string[]; intro: string; note: string; whoFor: string[]; outro: string;
};

export function routeInfo(p: Post, lang: Lang): RouteInfo {
  const m = META[p.slug];
  const src = lang === "tr" ? fixTr(p.content) : p.content;
  const lines = src.split("\n");
  const days: RouteDay[] = [];
  const intro: string[] = [];
  const who: string[] = [];
  const outro: string[] = [];
  let sec: "intro" | "days" | "who" | "other" = "intro";
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith("## ")) {
      sec = /gün gün|day by day/i.test(l) ? "days" : /kimlere|who is it/i.test(l) ? "who" : "other";
      continue;
    }
    const d = l.match(/^[-*]\s*\*\*(?:Gün|Day)\s*(\d+):?\*\*:?\s*(.*)$/i);
    if (d) {
      const n = Number(d[1]);
      const body = d[2].trim();
      const c = body.indexOf(":");
      const stop = m?.stops[n - 1];
      const title = stop ? nm(stop, lang) : c > 0 ? body.slice(0, c) : body.split(/[,;(]/)[0];
      const before = c > 0 ? body.slice(0, c).trim() : "";
      const simple = before.toLocaleLowerCase("tr") === title.toLocaleLowerCase("tr") || /^(seyir günü|serbest gün|sailing day|free day)$/i.test(before);
      let text = c > 0 && c < 70 && simple ? body.slice(c + 1).trim() : body;
      text = text.charAt(0).toLocaleUpperCase(lang === "tr" ? "tr" : "en") + text.slice(1);
      days.push({ n, title, text, acts: ACT.filter(([, re]) => re.test(body)).map(([a]) => a).slice(0, 3) });
      continue;
    }
    if (/^(rota seçiminde|if you need help)/i.test(l)) { outro.push(l); sec = "other"; continue; }
    if (sec === "intro") intro.push(l);
    else if (sec === "who") { if (!/ek masraf|ek ücret|extra cost|extra fee|additional cost/i.test(l)) who.push(l.replace(/^[-*]\s*/, "")); }
    else outro.push(l);
  }
  if (m?.days) {
    const list = m.days[lang === "tr" ? "tr" : "en"];
    days.length = 0;
    list.forEach((text, i) => days.push({ n: i + 1, title: nm(m.stops[i], lang), text, acts: ACT.filter(([, re]) => re.test(text)).map(([a]) => a).slice(0, 3) }));
  }
  const introText = intro.join(" ");
  const parts = introText.split(/(?<=\.)\s+/);
  const isNote = (s: string) => /örnektir|is an example|kaptanınız|captain may/i.test(s);
  const chart: string[] = [];
  for (const s of m?.stops ?? days.map((d) => d.title)) {
    if (GENERIC.has(s)) continue;
    const label = nm(s, lang);
    if (chart[chart.length - 1] !== label) chart.push(label);
  }
  const from = m?.from ?? p.title.split(/\s[-–/]\s/)[0];
  const to = m?.to ?? p.title.split(/\s[-–/]\s/).slice(-1)[0];
  const loop = from === to;
  if (loop && chart.length > 1 && chart[chart.length - 1] === chart[0]) chart.pop();
  return {
    from: nm(from, lang), to: nm(to, lang), loop, greek: !!m?.greek || /yunan|greek/i.test(p.title), port: m?.port ?? null,
    days, chart, intro: parts.filter((s) => !isNote(s)).join(" "), note: parts.filter(isNote).join(" "), whoFor: who, outro: outro.join(" "),
  };
}

export const ROUTE_UI = {
  tr: {
    eyebrow: "Klasik rota", days: (n: number) => `${n} gün · ${Math.max(n - 1, 1)} gece`, from: "Kalkış", to: "Varış", loop: "Aynı limana dönüş", oneway: "Tek yön",
    stops: (n: number) => `${n} durak`, greek: "Yunan adaları", quote: "Bu rota için teklif alın", program: "Programı görün", dayLabel: "Gün",
    programEyebrow: "Gün gün program", programTitle: "Rotanızın akışı.", whoEyebrow: "Kimlere uygun?", noteTitle: "Program esnektir",
    onewayNote: "Tek yön rotalarda tekne bir limandan alınıp başka bir limanda teslim edilir; bu durum tekneye göre ek ücret getirebilir.",
    greekNote: "Yunan adalarına geçişte pasaport ve giriş-çıkış işlemleri gerekir. Belgeleri rezervasyon sırasında birlikte netleştiririz.",
    boatsEyebrow: "Bu rotaya uygun tekneler", boatsTitle: (p: string) => `${p} çıkışlı tekneler`, allBoats: "Tüm tekneler",
    ctaTitle: "Bu rotada yelken açmaya hazır mısınız?", ctaText: "Tarihlerinizi ve kişi sayınızı yazın, size uygun tekneyi ve programı birlikte netleştirelim.", write: "Bize yazın",
    more: "Diğer rotalar", all: "Tümü", allRoutes: "Tüm rotalar", filter: "Kalkış limanı", route: "Rotayı incele", count: (n: number) => `${n} rota`, chartLabel: "Rota şeması",
    acts: { swim: "Yüzme", snorkel: "Şnorkel", walk: "Yürüyüş", dinner: "Akşam yemeği", sunset: "Gün batımı", history: "Tarih", market: "Çarşı", sail: "Uzun seyir", passport: "Pasaport", beach: "Plaj", relax: "Dinlenme" },
  },
  en: {
    eyebrow: "Classic route", days: (n: number) => `${n} days · ${Math.max(n - 1, 1)} nights`, from: "Departure", to: "Arrival", loop: "Round trip", oneway: "One way",
    stops: (n: number) => `${n} stops`, greek: "Greek islands", quote: "Get a quote for this route", program: "See the programme", dayLabel: "Day",
    programEyebrow: "Day by day", programTitle: "How your voyage unfolds.", whoEyebrow: "Who is it for?", noteTitle: "A flexible programme",
    onewayNote: "On one-way routes the boat is picked up in one port and returned in another; depending on the boat, this may involve an extra fee.",
    greekNote: "Crossing to the Greek islands requires passports and entry/exit formalities. We'll sort out the documents together when you book.",
    boatsEyebrow: "Boats for this route", boatsTitle: (p: string) => `Boats departing from ${p}`, allBoats: "All boats",
    ctaTitle: "Ready to set sail on this route?", ctaText: "Tell us your dates and group size, and we'll finalise the right boat and programme together.", write: "Write to us",
    more: "More routes", all: "All", allRoutes: "All routes", filter: "Departure port", route: "View route", count: (n: number) => `${n} routes`, chartLabel: "Route chart",
    acts: { swim: "Swimming", snorkel: "Snorkelling", walk: "Walking", dinner: "Dinner", sunset: "Sunset", history: "History", market: "Market", sail: "Long sail", passport: "Passport", beach: "Beach", relax: "Relaxing" },
  },
};

export type CardData = { slug: string; title: string; excerpt: string; href: string; from: string; to: string; loop: boolean; greek: boolean; days: number; chart: string[] };
export function toCard(p: Post, lang: Lang): CardData {
  const R = routeInfo(p, lang);
  return { slug: p.slug, title: p.title, excerpt: p.excerpt, href: href(lang, `/rotalar/${p.slug}`), from: R.from, to: R.to, loop: R.loop, greek: R.greek, days: R.days.length, chart: R.chart };
}
