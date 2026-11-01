// Su oyuncakları ve donanım seçenekleri. Veritabanında düz metin olarak saklanır:
//   su oyuncağı:  "Jet ski ×2"   (adet yoksa sadece "Jet ski")
//   donanım:      "Klima — gece 00:00–07:00"   (ayrıntı yoksa sadece "Klima")
export const WATER_TOYS = [
  "Jet ski", "Seabob", "Paddle board", "Kano", "Wakeboard", "Su kayağı", "Kneeboard", "Monoski",
  "Ringo", "Muz (banana) botu", "Şişme kaydırak", "Rüzgar sörfü", "Şnorkel ekipmanı", "Balık tutma ekipmanı",
  "Dalış ekipmanı", "Yüzme platformu",
];
// Eski kayıtlarda farklı yazılmış adların karşılığı.
const TOY_ALIASES: Record<string, string> = {
  "deniz kanosu": "Kano", "şnorkel takımı": "Şnorkel ekipmanı", "olta takımı": "Balık tutma ekipmanı",
  "şişme deniz oyuncakları": "Şişme kaydırak", "yüzme platformu": "Yüzme platformu", "yüzen yüzme platformu": "Yüzme platformu",
  "yüzen platform": "Yüzme platformu", "su kaydırağı": "Şişme kaydırak", "tüp (tube)": "Muz (banana) botu",
};

export const EQUIPMENT: { name: string; hint: string; options?: string[] }[] = [
  { name: "Klima", hint: "Çalışma saati seçin ya da yazın", options: ["Tam gün (24 saat)", "Gece 00:00–07:00 arası", "Gece 23:00–08:00 arası", "Yalnızca kabinlerde", "Salon ve kabinlerde, gün boyu", "Jeneratör açıkken"] },
  { name: "Wi-Fi", hint: "Örn: yalnızca Türk karasularında" },
  { name: "Jakuzi", hint: "Örn: üst güvertede" },
  { name: "Flybridge", hint: "" },
  { name: "Tender", hint: "Örn: 115 HP, 12 kişilik" },
  { name: "Sauna", hint: "" },
  { name: "Jeneratör", hint: "Örn: gece kapalı" },
  { name: "Su yapıcı", hint: "" },
  { name: "Buz makinesi", hint: "" },
  { name: "Eğlence sistemi", hint: "Örn: TV, müzik sistemi" },
  { name: "Fitness", hint: "" },
];
const SEP = " — ";

const norm = (s: string) => s.trim().toLocaleLowerCase("tr");

export function parseToy(raw: string): { name: string; qty: number | null } {
  const m = raw.match(/^(.*?)\s*(?:[×x]\s*(\d+)|\((\d+)\s*adet\))\s*$/i);
  const base = (m ? m[1] : raw).trim();
  const qty = m ? Number(m[2] ?? m[3]) : null;
  const canon = WATER_TOYS.find((t) => norm(t) === norm(base)) ?? TOY_ALIASES[norm(base)] ?? base;
  return { name: canon, qty: qty && qty > 0 ? qty : null };
}

export function parseEquipment(raw: string): { name: string; detail: string } {
  const i = raw.indexOf(SEP);
  const base = (i >= 0 ? raw.slice(0, i) : raw).trim();
  const detail = i >= 0 ? raw.slice(i + SEP.length).trim() : "";
  const canon = EQUIPMENT.find((e) => norm(e.name) === norm(base))?.name ?? base;
  return { name: canon, detail };
}

export const formatToy = (name: string, qty: number | null) => (qty && qty > 1 ? `${name} ×${qty}` : name);
export const formatEquipment = (name: string, detail: string) => (detail.trim() ? `${name}${SEP}${detail.trim()}` : name);
