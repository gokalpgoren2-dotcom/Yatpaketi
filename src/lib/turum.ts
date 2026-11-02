// Turum (müşteri paneli) ek bölümlerinin türleri ve seçenekleri. Hem sunucuda hem tarayıcıda kullanılır.

export type Prefs = {
  market?: string;
  allergy?: { has?: boolean; text?: string };
  chronic?: { has?: boolean; text?: string };
  celebration?: { has?: boolean; type?: string; date?: string; note?: string };
  service?: string;
  activities?: string[];
  activitiesOther?: string;
  notes?: string;
};
export type Guest = { full_name: string; gender?: string | null; birth_date?: string | null; nationality?: string | null; doc_type?: string | null; doc_no?: string | null; phone?: string | null };
export type PortalMenu = { id: string; title: string; description: string | null; file_path: string | null; chosen: boolean };
export type PortalFile = { id: string; kind: "shopping" | "receipt"; title: string; note: string | null; path: string | null; created_at: string };
export type PortalExtras = { prefs: Prefs; guests: Guest[]; menus: PortalMenu[]; files: PortalFile[] };


export const MARKETS: [string, string][] = [["macrocenter", "Macrocenter"], ["carrefoursa", "CarrefourSA"], ["migros", "Migros"], ["metro", "Metro"]];
export const SERVICES: [string, string, string][] = [
  ["samimi", "Samimi", "Sıcak, sohbet eden, aileden biri gibi"],
  ["profesyonel", "Profesyonel", "Nazik, mesafeli ve gerektiğinde yanınızda"],
  ["dengeli", "Dengeli", "İkisinin arası; ortama göre"],
];
export const ACTIVITIES = ["Su sporları", "Jet ski", "Yüzme", "Balıkçılık", "Dalış", "Gece hayatı", "Kıyı gezileri", "Alışveriş", "Beach", "Diğer"];
export const CELEBRATIONS = ["Doğum günü", "Evlilik yıl dönümü", "Evlilik teklifi", "Balayı", "Diğer"];
