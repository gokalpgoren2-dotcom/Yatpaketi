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
export type PortalFile = { id: string; kind: "shopping" | "receipt"; title: string; note: string | null; path: string | null; created_at: string; approved_at?: string | null; change_requested_at?: string | null; customer_note?: string | null };
export type PortalExtras = { kvkk_info_at?: string | null; kvkk_health_at?: string | null; prefs: Prefs; guests: Guest[]; menus: PortalMenu[]; files: PortalFile[] };


export const MARKETS: [string, string][] = [["macrocenter", "Macrocenter"], ["carrefoursa", "CarrefourSA"], ["migros", "Migros"], ["metro", "Metro"]];
export const SERVICES: [string, string, string][] = [
  ["samimi", "Samimi", "Sıcak, sohbet eden, aileden biri gibi"],
  ["profesyonel", "Profesyonel", "Nazik, mesafeli ve gerektiğinde yanınızda"],
  ["dengeli", "Dengeli", "İkisinin arası; ortama göre"],
];
export const ACTIVITIES = ["Su sporları", "Jet ski", "Yüzme", "Balıkçılık", "Dalış", "Gece hayatı", "Kıyı gezileri", "Alışveriş", "Beach", "Diğer"];
export const CELEBRATIONS = ["Doğum günü", "Evlilik yıl dönümü", "Evlilik teklifi", "Balayı", "Diğer"];

// KVKK metinleri. Veri sorumlusunun tam unvanı ve adresi şirket bilgilerine göre güncellenmelidir.
export const KVKK_INFO: [string, string][] = [
  ["Veri sorumlusu", "Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla Yatpaketi tarafından işlenir."],
  ["İşlenen veriler", "Misafir listesine girilen ad soyad, uyruk, doğum tarihi, cinsiyet, T.C. kimlik veya pasaport numarası ve isteğe bağlı telefon numarası."],
  ["İşleme amacı", "Yatın tur öncesi limandan çıkış yapabilmesi için zorunlu olan transit log ve liman/sahil güvenlik kayıtlarının hazırlanması, kiralama sözleşmesinin yerine getirilmesi ve tur boyunca güvenliğinizin sağlanması."],
  ["Hukuki sebep", "KVKK md. 5/2-ç (veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi) ve md. 5/2-c (sözleşmenin kurulması ve ifası)."],
  ["Aktarım", "Veriler yalnızca bu amaçlarla ilgili liman başkanlığı ve diğer yetkili kamu kurumlarına, yatın kaptanına ve işletmecisine aktarılır; başka hiçbir amaçla paylaşılmaz."],
  ["Saklama süresi", "Veriler, ilgili mevzuatta öngörülen süre boyunca saklanır; süre sonunda silinir veya anonim hâle getirilir."],
  ["Haklarınız", "KVKK md. 11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltilmesini veya silinmesini isteme ve itiraz etme haklarına sahipsiniz. Başvurularınızı {iletisim} iletebilirsiniz."],
];
export const KVKK_GUEST_CONSENT = "Kişisel Verilerin Korunması Kanunu kapsamındaki aydınlatma metnini okudum. Listeye eklediğim misafirleri bu metin hakkında bilgilendirdim ve onlar adına bilgi girmeye yetkiliyim.";
export const KVKK_HEALTH_CONSENT = "Alerji ve kronik hastalık bilgilerinin (özel nitelikli kişisel veri) yalnızca tur sırasındaki güvenlik, yemek hazırlığı ve acil durum amacıyla ekip ve mürettebat tarafından işlenmesine açık rıza veriyorum.";

// Aydınlatma metni ve onay kutusu (misafir listesi ve tercihlerde kullanılır)
