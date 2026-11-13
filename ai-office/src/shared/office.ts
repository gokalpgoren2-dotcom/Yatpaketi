import type { AgentId, DeskStatus, JobStatus } from "./types";

// Ofisin görsel katmanı: masaların yeri, avatarların görünümü, Türkçe etiketler.
// Yürütme motorundan bağımsızdır; burada iş durumu üretilmez.

export interface DeskLook {
  id: AgentId;
  name: string;
  role: string;
  /** ızgara konumu (karo) */
  gx: number;
  gy: number;
  accent: string;
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "bun" | "bald" | "cap" | "curly";
  shirt: string;
  extra?: "glasses" | "headset" | "tie" | "scarf";
}

export const GRID = { cols: 14, rows: 10 };
/** Yürüme ağı: iki yatay koridor, yönetici masasına çıkan geçit ve koridorları bağlayan geçit */
export const AISLES = [5.5, 9.0] as const;
export const MASTER_CORRIDOR_X = 3.7;
export const LINK_CORRIDOR_X = 5.8;
export const MASTER_VISIT = { x: MASTER_CORRIDOR_X, y: 2.4 };
export const ENTRANCE = { x: 1.2, y: AISLES[1] };

export interface Pt {
  x: number;
  y: number;
}

/** Ziyaretçinin masanın önünde durduğu nokta */
export function visitPoint(d: DeskLook): Pt {
  if (d.id === "master-agent") return MASTER_VISIT;
  return { x: d.gx + 0.8, y: d.gy < 5 ? AISLES[0] : AISLES[1] };
}

const isMaster = (p: Pt) => Math.abs(p.y - MASTER_VISIT.y) < 0.01;
const nearestAisle = (y: number) => (Math.abs(y - AISLES[0]) <= Math.abs(y - AISLES[1]) ? AISLES[0] : AISLES[1]);

/** Zemine tıklanan noktayı yürünebilir en yakın koridor noktasına çeker */
export function snapToWalkable(p: Pt): Pt {
  return { x: Math.min(GRID.cols - 0.5, Math.max(0.5, p.x)), y: nearestAisle(p.y) };
}

/** Masalara çarpmadan koridorlar üzerinden yürüme yolu (ara noktalar, hedef dahil) */
export function walkPath(from: Pt, to: Pt): Pt[] {
  const path: Pt[] = [];
  let cur = from;
  const go = (p: Pt) => {
    if (Math.abs(p.x - cur.x) > 0.01 || Math.abs(p.y - cur.y) > 0.01) {
      path.push(p);
      cur = p;
    }
  };
  if (isMaster(cur) && !isMaster(to)) go({ x: MASTER_CORRIDOR_X, y: AISLES[0] });
  const targetAisle = isMaster(to) ? AISLES[0] : to.y;
  if (!isMaster(cur) && Math.abs(cur.y - targetAisle) > 0.01) {
    go({ x: LINK_CORRIDOR_X, y: cur.y });
    go({ x: LINK_CORRIDOR_X, y: targetAisle });
  }
  if (isMaster(to)) go({ x: MASTER_CORRIDOR_X, y: AISLES[0] });
  go(to);
  return path;
}

export const DESKS: DeskLook[] = [
  { id: "master-agent", name: "Kaptan", role: "Yönetici", gx: 3.6, gy: 0.5, accent: "#f4c95d", skin: "#e8b48a", hair: "#2b2b33", hairStyle: "cap", shirt: "#f5f1e6", extra: "tie" },
  { id: "frontend-agent", name: "Derin", role: "Frontend", gx: 1.2, gy: 3.2, accent: "#5ad1e0", skin: "#f1c7a1", hair: "#7a3e1d", hairStyle: "long", shirt: "#1bb4c4", extra: "glasses" },
  { id: "backend-agent", name: "Poyraz", role: "Backend", gx: 4.6, gy: 3.2, accent: "#7c9cff", skin: "#c98f62", hair: "#15151a", hairStyle: "short", shirt: "#33415c", extra: "headset" },
  { id: "seo-agent", name: "Mercan", role: "SEO", gx: 8, gy: 3.2, accent: "#7be0a4", skin: "#eec39a", hair: "#b5651d", hairStyle: "bun", shirt: "#2f9e6e" },
  { id: "competitor-agent", name: "Pusula", role: "Rakip Analizi", gx: 11.4, gy: 3.2, accent: "#ff9f6b", skin: "#a8744c", hair: "#1c1c22", hairStyle: "curly", shirt: "#c2552d", extra: "glasses" },
  { id: "meta-agent", name: "Yakamoz", role: "Meta ve Sosyal", gx: 3.3, gy: 7, accent: "#e08bff", skin: "#f3cfb0", hair: "#d9a441", hairStyle: "long", shirt: "#8b4fc9", extra: "scarf" },
  { id: "yacht-data-agent", name: "Çapa", role: "Tekne Verisi", gx: 6.7, gy: 7, accent: "#6fd3c1", skin: "#d9a57c", hair: "#555b66", hairStyle: "bald", shirt: "#0f6f7c" },
  { id: "security-qa-agent", name: "Fener", role: "Güvenlik ve QA", gx: 10.1, gy: 7, accent: "#ff7a8a", skin: "#e6b990", hair: "#3a2a20", hairStyle: "short", shirt: "#1d2b45", extra: "headset" },
];

export const deskOf = (id: AgentId) => DESKS.find((d) => d.id === id)!;

export const STATUS_LABEL: Record<DeskStatus, string> = {
  idle: "Boşta",
  queued: "Sırada",
  working: "Çalışıyor",
  approval_required: "Onay bekliyor",
  completed: "Tamamlandı",
  failed: "Başarısız",
  cancelled: "İptal edildi",
};

export const STATUS_COLOR: Record<DeskStatus, string> = {
  idle: "#7f8fa9",
  queued: "#e9c46a",
  working: "#2ad4e6",
  approval_required: "#ff9f43",
  completed: "#5fd38d",
  failed: "#ff6b7a",
  cancelled: "#94a0b8",
};

export const JOB_STATUS_ORDER: JobStatus[] = ["queued", "working", "approval_required", "completed", "failed", "cancelled"];

export const MODE_LABEL = { claude: "Gerçek mod (Claude)", local: "Yerel mod (LLM yok)" } as const;

/** Her masa için örnek görevler (boş sohbette öneri olarak gösterilir) */
export const SAMPLE_TASKS: Record<AgentId, string[]> = {
  "master-agent": ["Tekne verisi ve SEO durumunu kontrol ettir, tek raporda birleştir.", "Güvenlik taraması başlat ve sonucu özetle."],
  "frontend-agent": ["Görsellerde eksik alt metinlerini ve client bileşen sayısını raporla.", "Tekne detay sayfasının mobil görünümünü incele."],
  "backend-agent": ["Sunucu eylemlerinin ve Supabase tablolarının envanterini çıkar.", "Rezervasyon talebi akışındaki girdi doğrulamayı incele."],
  "seo-agent": ["Sayfaların metadata, canonical ve hreflang durumunu denetle.", "Bodrum gulet kiralama için içerik fırsatlarını çıkar."],
  "competitor-agent": ["Ece Yachting ve Luna Yatçılık'ın gulet portföyünü karşılaştır.", "Dört rakibin dil seçeneklerini ve rezervasyon akışını karşılaştır."],
  "meta-agent": ["Haziran için 4 haftalık Instagram içerik takvimi hazırla.", "Son 30 günün reklam performansını yorumla."],
  "yacht-data-agent": ["Tüm tekne ilanlarında eksik alan ve tutarsızlık taraması yap.", "Fotoğrafı 10'dan az olan tekneleri listele."],
  "security-qa-agent": ["Depoda gizli anahtar sızıntısı ve yetkisiz sunucu eylemi taraması yap.", "Lint ve tip kontrolünü çalıştır, hataları raporla."],
};
