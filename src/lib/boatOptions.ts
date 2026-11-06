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
  { name: "Klima", hint: "Çalışma saati seçin ya da yazın", options: ["Tam gün (24 saat), fiyata dahil", "Günde 4 saat fiyata dahil, fazlası ekstra", "Günde 6 saat fiyata dahil, fazlası ekstra", "Günde 8 saat fiyata dahil, fazlası ekstra", "Ekstra ücretli", "Gece 00:00–07:00 arası", "Gece 23:00–08:00 arası", "Yalnızca kabinlerde", "Salon ve kabinlerde, gün boyu", "Jeneratör açıkken"] },
  { name: "Wi-Fi", hint: "Örn: yalnızca Türk karasularında" },
  { name: "Jakuzi", hint: "Örn: üst güvertede" },
  { name: "Flybridge", hint: "" },
  { name: "Tender", hint: "Örn: 115 HP, 12 kişilik" },
  { name: "Sauna", hint: "" },
  { name: "Jeneratör", hint: "Örn: gece kapalı", options: ["Tam gün (24 saat), fiyata dahil", "Günde 4 saat fiyata dahil, fazlası ekstra", "Günde 6 saat fiyata dahil, fazlası ekstra", "Ekstra ücretli", "Gece kapalı"] },
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

// ---- İngilizce gösterim (site /en) ----
const TOY_EN: Record<string, string> = {
  "Jet ski": "Jet ski", "Seabob": "Seabob", "Paddle board": "Paddle board", "Kano": "Canoe / kayak", "Wakeboard": "Wakeboard",
  "Su kayağı": "Water skis", "Kneeboard": "Kneeboard", "Monoski": "Monoski", "Ringo": "Ringo ride", "Muz (banana) botu": "Banana boat",
  "Şişme kaydırak": "Inflatable slide", "Rüzgar sörfü": "Windsurf", "Şnorkel ekipmanı": "Snorkelling gear",
  "Balık tutma ekipmanı": "Fishing gear", "Dalış ekipmanı": "Diving equipment", "Yüzme platformu": "Swim platform",
  "Deniz scooter'ı": "Sea scooter", "Yüzme makarnaları": "Pool noodles",
};
const EQ_EN: Record<string, string> = {
  "Klima": "Air conditioning", "Wi-Fi": "Wi-Fi", "Jakuzi": "Jacuzzi", "Flybridge": "Flybridge", "Tender": "Tender", "Sauna": "Sauna",
  "Jeneratör": "Generator", "Su yapıcı": "Watermaker", "Buz makinesi": "Ice maker", "Eğlence sistemi": "Entertainment system", "Fitness": "Fitness", "Minibar": "Minibar", "Masaj odası": "Massage room", "Yüzme platformu": "Swim platform",
};

const TOY_RU: Record<string, string> = {
  "Jet ski": "Гидроцикл", "Seabob": "Seabob", "Paddle board": "SUP-доска", "Kano": "Каноэ / каяк", "Wakeboard": "Вейкборд",
  "Su kayağı": "Водные лыжи", "Kneeboard": "Кнеборд", "Monoski": "Монолыжа", "Ringo": "Ринго (буксируемый круг)", "Muz (banana) botu": "Банан",
  "Şişme kaydırak": "Надувная горка", "Rüzgar sörfü": "Виндсёрфинг", "Şnorkel ekipmanı": "Снаряжение для снорклинга",
  "Balık tutma ekipmanı": "Рыболовное снаряжение", "Dalış ekipmanı": "Снаряжение для дайвинга", "Yüzme platformu": "Платформа для купания",
  "Deniz scooter'ı": "Подводный скутер", "E-foil": "E-foil", "Flyfish": "Flyfish", "Ringo ride": "Ринго", "Yüzme makarnaları": "Нудлы для плавания",
};
const EQ_RU: Record<string, string> = {
  "Klima": "Кондиционер", "Wi-Fi": "Wi-Fi", "Jakuzi": "Джакузи", "Flybridge": "Флайбридж", "Tender": "Тендер", "Sauna": "Сауна",
  "Jeneratör": "Генератор", "Su yapıcı": "Опреснитель", "Buz makinesi": "Льдогенератор", "Eğlence sistemi": "Развлекательная система", "Fitness": "Фитнес",
  "Minibar": "Мини-бар", "Masaj odası": "Массажная комната", "Yüzme platformu": "Платформа для купания",
};
// Ayrıntı metinleri (ör. "Saatte 200 litre", "Tüm kabinlerde") için uzun ifadeden kısaya doğru çeviri.
const PHRASES: [string, string, string][] = [
  ["Uydu TV", "Satellite TV", "Спутниковое ТВ"], ["Subwing", "Subwing", "Subwing"], ["GTX 300 Limited, ekstra ücretli", "GTX 300 Limited, extra charge", "GTX 300 Limited, за доп. плату"],
  ["Tüm kabinlerde Smart TV", "Smart TV in all cabins", "Smart TV во всех каютах"], ["Tüm kabinlerde TV", "TV in all cabins", "ТВ во всех каютах"],
  ["Tam gün (24 saat), fiyata dahil", "All day (24 hours), included in the price", "Весь день (24 часа), включено в цену"],
  ["Günde 4 saat fiyata dahil, fazlası ekstra", "4 hours a day included, extra beyond that", "4 часа в день включены, сверх — за доп. плату"],
  ["Günde 6 saat fiyata dahil, fazlası ekstra", "6 hours a day included, extra beyond that", "6 часов в день включены, сверх — за доп. плату"],
  ["Günde 8 saat fiyata dahil, fazlası ekstra", "8 hours a day included, extra beyond that", "8 часов в день включены, сверх — за доп. плату"],
  ["Salon ve kabinlerde, gün boyu", "Saloon and cabins, all day", "В салоне и каютах, весь день"],
  ["Gece 00:00–07:00 arası", "At night, 00:00–07:00", "Ночью, 00:00–07:00"], ["Gece 23:00–08:00 arası", "At night, 23:00–08:00", "Ночью, 23:00–08:00"],
  ["Tam gün (24 saat)", "All day (24 hours)", "Весь день (24 часа)"], ["Yalnızca kabinlerde", "In cabins only", "Только в каютах"],
  ["Jeneratör açıkken", "While the generator is running", "При работающем генераторе"], ["Gece kapalı", "Off at night", "Ночью выключен"],
  ["1 dahil, 2. ekstra ücretli", "1 included, the 2nd at extra charge", "1 включён, 2-й за доп. плату"],
  ["Her kabinde uzaktan kumandalı", "Remote-controlled in every cabin", "С пультом в каждой каюте"],
  ["Her kabinde marin tipi", "Marine-type in every cabin", "Морского типа в каждой каюте"],
  ["Flybridge'de Technogym seti", "Technogym set on the flybridge", "Тренажёры Technogym на флайбридже"],
  ["Yunanistan'da Starlink", "Starlink in Greece", "Starlink в Греции"],
  ["VIP kabinde ve güvertede", "In the VIP cabin and on deck", "В VIP-каюте и на палубе"],
  ["Servis tenderı", "Service tender", "Служебный тендер"], ["Spor tender", "Sport tender", "Спортивный тендер"], ["Motorlu bot", "Motor boat", "Моторная лодка"],
  ["sinema ses sistemi", "cinema sound system", "кинотеатральная аудиосистема"], ["karaoke hoparlörü", "karaoke speaker", "караоке-колонка"],
  ["Bluetooth ses sistemi", "Bluetooth sound system", "Bluetooth-аудиосистема"], ["Bluetooth müzik sistemi", "Bluetooth music system", "Bluetooth-музыкальная система"],
  ["Bluetooth hoparlör", "Bluetooth speaker", "Bluetooth-колонка"], ["Bose ses sistemi", "Bose sound system", "Аудиосистема Bose"],
  ["Müzik sistemi", "Music system", "Музыкальная система"], ["müzik sistemi", "music system", "музыкальная система"],
  ["DVD/CD oynatıcı", "DVD/CD player", "DVD/CD-плеер"], ["iPod bağlantısı", "iPod connection", "подключение iPod"],
  ["kutu oyunları", "board games", "настольные игры"], ["uydu TV", "satellite TV", "спутниковое ТВ"],
  ["Salonda ve tüm kabinlerde", "In the saloon and all cabins", "В салоне и всех каютах"], ["Salonda ve kıç güvertede", "In the saloon and on the aft deck", "В салоне и на кормовой палубе"],
  ["Tüm kabinlerde ve salonda", "In all cabins and the saloon", "Во всех каютах и в салоне"], ["Tüm kabinlerde", "In all cabins", "Во всех каютах"],
  ["salonda", "in the saloon", "в салоне"], ["Salonda", "In the saloon", "В салоне"], ["Kabinlerde", "In the cabins", "В каютах"],
  ["salon, kıç güverte, master kabin", "saloon, aft deck, master cabin", "салон, кормовая палуба, мастер-каюта"],
  ["Baş güvertede", "On the foredeck", "На носовой палубе"], ["Güvertede", "On deck", "На палубе"], ["Flybridge'de", "On the flybridge", "На флайбридже"],
  ["(ekstra ücretli)", "(extra charge)", "(за доп. плату)"], ["ekstra ücretli", "extra charge", "за доп. плату"], ["Ekstra ücretli", "Extra charge", "За доп. плату"],
  ["Türkiye sularında sınırsız", "Unlimited in Turkish waters", "Безлимитный в турецких водах"],
  ["Sınırsız", "Unlimited", "Безлимитный"], ["Beach club", "Beach club", "Бич-клуб"],
  [" ve ", " and ", " и "],
];
function trDetail(detail: string, lang: "en" | "ru"): string {
  let d = detail;
  for (const [tr, en, ru] of PHRASES) d = d.split(tr).join(lang === "ru" ? ru : en);
  d = d.replace(/Saatte (\d+) litre/gi, lang === "ru" ? "$1 л/ч" : "$1 l/h").replace(/(\d+) kişilik/g, lang === "ru" ? "на $1 чел." : "for $1 people");
  if (lang === "ru") d = d.replace(/(\d)\s*HP\b/g, "$1 л. с.");
  return d;
}

export function localizeToy(raw: string, lang: "tr" | "en" | "ru"): string {
  if (lang === "tr") return raw;
  const i = raw.indexOf(SEP);
  const detail = i >= 0 ? raw.slice(i + SEP.length).trim() : "";
  const { name, qty } = parseToy(i >= 0 ? raw.slice(0, i) : raw);
  const label = formatToy((lang === "ru" ? TOY_RU[name] : TOY_EN[name]) ?? name, qty);
  return detail ? `${label}${SEP}${trDetail(detail, lang)}` : label;
}
export function localizeEquipment(raw: string, lang: "tr" | "en" | "ru"): string {
  if (lang === "tr") return raw;
  const { name, detail } = parseEquipment(raw);
  return formatEquipment((lang === "ru" ? EQ_RU[name] : EQ_EN[name]) ?? name, detail ? trDetail(detail, lang) : "");
}
