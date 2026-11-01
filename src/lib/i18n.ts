export type Lang = "tr" | "en";

// İngilizce sayfalar /en altındadır; adresler (tekne, bölge adresleri) Türkçe ile aynıdır.
export function href(lang: Lang, path: string): string {
  if (lang === "tr") return path;
  if (path === "/") return "/en";
  if (path.startsWith("/#")) return `/en${path.slice(1)}`;
  return `/en${path}`;
}

export function langFromPath(path: string): Lang {
  return path === "/en" || path.startsWith("/en/") || path.startsWith("/en#") ? "en" : "tr";
}

// Bulunulan sayfanın diğer dildeki karşılığı.
const EN_PAGES = ["/tekneler", "/limanlar", "/tekne-tipleri", "/rehber", "/destinasyonlar", "/rotalar", "/tur-paketleri", "/kiralama-sureci"];
export function switchPath(path: string, to: Lang): string {
  const bare = path === "/en" ? "/" : path.startsWith("/en/") ? path.slice(3) : path;
  if (to === "en") {
    // İngilizce karşılığı olmayan sayfalardan (blog, rehber, hakkımızda...) İngilizce ana sayfaya gidilir.
    const ok = bare === "/" || EN_PAGES.some((p) => bare === p || bare.startsWith(p + "/"));
    return ok ? href("en", bare) : "/en";
  }
  return bare;
}

const tr = {
  locale: "tr-TR",
  months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  days: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
  // menü
  navHome: "Ana Sayfa", navBoats: "Kiralık Tekneler", navAllBoats: "Tüm tekneler", navDest: "Limanlar", navAllDest: "Tüm limanlar",
  navGuide: "Yatpaketi Rehberi", navBlueVoyage: "Mavi Yolculuk", navBlog: "Blog", navAbout: "Hakkımızda", navContact: "İletişim",
  langGroup: "Dil seçimi", mainMenu: "Ana menü", mobileMenu: "Mobil menü", menuOpen: "Menüyü aç", menuClose: "Menüyü kapat", homeAria: "yatpaketi ana sayfa",
  // mobil çubuk
  quickMenu: "Hızlı menü", mbHome: "Ana sayfa", mbBoats: "Tekneler", mbDest: "Limanlar", mbContact: "İletişim",
  // arama
  searchAria: "Tekne arama", location: "Lokasyon", boatType: "Tekne tipi", all: "Tümü", date: "Tarih", searchBoats: "Tekneleri ara",
  popular: "Popüler:", country: "Türkiye",
  // ana sayfa
  heroTitle: "Hayalinizdeki mavi yolculuğu kiralayın",
  heroSubtitle: "Gulet, motoryat, katamaran ve yelkenli seçeneklerini keşfedin, rezervasyon talebinizi iletin.",
  byType: "Tekne tipine göre keşfedin",
  featuredEyebrow: "Öne çıkan tekneler", featuredTitle: "Sizin için seçtiklerimiz", allBoatsBtn: "Tüm tekneler",
  sampleHome: "Örnek içerik: Veritabanı bağlı olmadığı için örnek tekneler gösteriliyor.",
  noBoatsHome: "Henüz yayında tekne yok. Çok yakında burada olacak.",
  howEyebrow: "Nasıl çalışır?", howTitle: "Üç adımda talebinizi iletin",
  steps: [
    ["1", "Tekneyi seçin", "Bölge, tarih, kişi sayısı ve bütçenize göre tekneleri filtreleyin."],
    ["2", "Talebinizi iletin", "Tarih ve kişi sayınızla rezervasyon talebi oluşturun. Talep ücretsizdir."],
    ["3", "Onayı bekleyin", "Müsaitlik ve fiyat teyit edilir. Rezervasyon, onaydan sonra kesinleşir."],
  ] as string[][],
  destEyebrow: "Limanlar", destTitle: "Popüler tekne kiralama limanları", seeAll: "Hepsini gör",
  modesEyebrow: "Kiralama seçenekleri", modesTitle: "İhtiyacınıza göre planlayın",
  modes: [
    ["Günlük kiralama", "Koy turları, doğum günü ve özel organizasyonlar için."],
    ["Haftalık kiralama", "Kabinli mavi yolculuk: kaptan ve mürettebat dahil seçenekler."],
    ["Lüks yat koleksiyonu", "Üst segment yatlar, kişiye özel rota ve hizmet."],
  ] as string[][],
  seeBoats: "Tekneleri gör →",
  routesEyebrow: "Mavi yolculuk", routesTitle: "Klasik rotalar",
  routes: [
    ["Göcek – 12 Ada", "7 gün", "Tersane, Cleopatra, Kapı Creek"],
    ["Bodrum – Datça", "7 gün", "Karaada, Knidos, Gökova"],
    ["Fethiye – Kekova", "7 gün", "Kaş, Kekova, Kaleköy"],
  ] as string[][],
  whyEyebrow: "Neden yatpaketi?", whyTitle: "Güvenle seçin, rahatça yolculuk yapın",
  why: [
    ["Seçilmiş filo", "Tekneleri tek tek inceleyip listeliyoruz."],
    ["Şeffaf süreç", "Rezervasyon talebiniz kesin rezervasyon değildir; onay sonrası netleşir."],
    ["Yerel uzmanlık", "Rota ve koy önerilerinde bölgeyi bilen ekip."],
    ["Yakın destek", "Telefon ve WhatsApp ile hızlı iletişim."],
  ] as string[][],
  blogEyebrow: "Yatpaketi Rehberi", blogTitle: "Okuyun, planlayın", allPosts: "Tüm yazılar",
  footTag: "Türkiye’de yat ve tekne kiralama platformu.", customerLogin: "Müşteri Girişi", rights: "Tüm hakları saklıdır.",
  // tekne kartı
  captained: "Mürettebatlı", askPrice: "Fiyat sorunuz", guestsN: (n: number) => `${n} misafir`, cabinsN: (n: number) => `${n} kabin`,
  perWeek: "/ hafta’dan", perDay: "/ gün’den",
  // liste sayfası
  listEyebrow: "Kiralık Tekneler", listTitle: "Size Uygun Tekneyi Bulun",
  datesNote: "Sonuçlar tarihe göre filtrelenmez. Müsaitlik, talebiniz sonrasında teyit edilir.",
  fDest: "Liman", fType: "Tekne tipi", fGuests: "Misafir (en az)", fCabins: "Kabin (en az)", fMin: "En düşük fiyat", fMax: "En yüksek fiyat",
  fLength: "Uzunluk (en az, m)", fYear: "Yapım yılı (en az)", fRental: "Kiralama", fBoth: "Günlük ve haftalık", fDaily: "Günlük", fWeekly: "Haftalık",
  fCaptain: "Kaptan", fAny: "Fark etmez", fWithCaptain: "Kaptanlı", fNoCaptain: "Kaptansız", fCrew: "Mürettebat", fWithCrew: "Mürettebatlı", fNoCrew: "Mürettebatsız",
  fSort: "Sıralama", sRec: "Önerilen", sPriceAsc: "En düşük fiyat", sPriceDesc: "En yüksek fiyat", sNew: "En yeni eklenen", sLength: "Tekne uzunluğu",
  filter: "Filtrele", clear: "Temizle",
  priceNote: "Fiyat filtresi EUR, haftalık fiyat üzerinden çalışır (günlük kiralama seçiliyse günlük fiyat). “Fiyat sorunuz” teknelerinde fiyat filtresi uygulanamaz.",
  foundN: (n: number) => `${n} tekne bulundu`, noneYet: "Henüz yayında tekne yok.", noMatch: "Bu filtrelere uygun tekne bulunamadı. Filtreleri gevşetmeyi deneyin.",
  // tekne sayfası
  breadcrumb: "Sayfa yolu", sendRequest: "Talep gönder", photoN: (n: number) => `fotoğraf ${n}`, sampleBoat: "Örnek içerik: Veritabanı bağlı olmadığı için örnek tekne gösteriliyor.",
  about: "Tekne hakkında", specs: "Teknik özellikler", notStated: "Belirtilmedi",
  sType: "Tekne tipi", sBrand: "Marka / model", sYear: "Yapım yılı", sRefit: "Yenileme yılı", sLen: "Uzunluk", sWidth: "Genişlik", sCabins: "Kabin", sCap: "Misafir kapasitesi",
  sCrew: "Mürettebat", crewN: (n: number) => `${n} kişi`, noCrew: "Mürettebatsız", sCaptain: "Kaptan", included: "Dahil", notIncluded: "Dahil değil",
  sPort: "Kalkış limanı", sRegions: "Kiralama bölgeleri",
  equipment: "Donanımlar", toys: "Su sporları ekipmanları", availability: "Müsaitlik",
  availText: "Müsaitlik ve kesin fiyat, rezervasyon talebiniz sonrasında teyit edilir. Tarihlerinizi talep kartından iletebilirsiniz.",
  price: "Fiyat", dailyPrice: "Günlük", requestTitle: "Rezervasyon talebi gönderin", similar: "Benzer tekneler",
  rental: "Kiralama", titleSuffix: "Kiralama",
  // talep formları
  pickDates: "Lütfen giriş ve çıkış tarihini seçin.", endBefore: "Çıkış tarihi giriş tarihinden önce olamaz.",
  waGreeting: (b: string) => `Merhaba, ${b} teknesi için rezervasyon talebi iletmek istiyorum.`,
  waDate: "Tarih", waGuests: "Misafir sayısı", waName: "Ad soyad", waBoat: "Tekne",
  guestCount: "Misafir sayısı", lessGuests: "Misafir sayısını azalt", moreGuests: "Misafir sayısını artır",
  yourNameOpt: "Adınız (isteğe bağlı)", sendWa: "WhatsApp ile talep gönder",
  waHelp: "Hazır mesaj WhatsApp’ta açılır, göndermeden önce düzenleyebilirsiniz. Talebiniz kesin rezervasyon değildir; müsaitlik ve fiyat teyit edilir.",
  noWa: "WhatsApp kullanmıyorsanız formu doldurun",
  received: "Talebiniz alındı.", receivedNote: "Bu bir kesin rezervasyon değildir. Müsaitlik ve fiyat teyit edildikten sonra sizinle iletişime geçeceğiz.",
  formAria: (b: string) => `${b} rezervasyon talebi`, fullName: "Ad soyad *", phone: "Telefon", email: "E-posta", contactNote: "Telefon veya e-postadan en az birini yazın.",
  guestsReq: "Misafir sayısı *", message: "Mesaj", consent: "Bilgilerimin, bu talebi yanıtlamak amacıyla yatpaketi tarafından işlenmesini kabul ediyorum.",
  sending: "Gönderiliyor…", submit: "Rezervasyon Talebi Gönder", formNote: "Talebiniz kesin rezervasyon oluşturmaz. Müsaitlik ve fiyat teyit edildikten sonra rezervasyon kesinleşir.",
  // keşfet sayfaları
  routePick: "Rotanızı Seçin", boatsCount: (n: number) => `${n} tekne`,
  destHero: (n: string) => `${n} Tekne Kiralama`, destBoats: (n: string) => `${n} çıkışlı tekneler`, destNone: "Bu liman için henüz tekne eklenmedi.",
  sampleData: "Örnek içerik: Veritabanı bağlı olmadığı için örnek veri gösteriliyor.",
  catHero: (n: string) => `${n} Kiralama`, catBoats: (n: string) => `${n} tekneleri`, catNone1: "Bu tipte henüz yayında tekne yok.", catNone2: "Tüm tekneleri", catNone3: "inceleyebilirsiniz.",
  // takvim
  checkIn: "Giriş", checkOut: "Çıkış", applyDates: "Tamam", prevMonth: "Önceki ay", nextMonth: "Sonraki ay", pickBoth: "Giriş ve çıkış tarihini seçin", pickEnd: "çıkış tarihini seçin",
  tapEnd: "Şimdi çıkış tarihine dokunun.", tapStart: "Önce giriş, sonra çıkış tarihine dokunun.",
  // iletişim balonu
  call: "Ara", contactAria: "İletişim", reachUs: "Bize ulaşın", sendEmail: "E-posta gönder", writeUs: "Bize yazın", closeContact: "İletişim menüsünü kapat", openContact: "İletişim menüsünü aç",
};

const en: typeof tr = {
  locale: "en-GB",
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  navHome: "Home", navBoats: "Boats for Charter", navAllBoats: "All boats", navDest: "Ports", navAllDest: "All ports",
  navGuide: "Yatpaketi Guide", navBlueVoyage: "Blue Voyage", navBlog: "Blog", navAbout: "About us", navContact: "Contact",
  langGroup: "Language", mainMenu: "Main menu", mobileMenu: "Mobile menu", menuOpen: "Open menu", menuClose: "Close menu", homeAria: "yatpaketi home",
  quickMenu: "Quick menu", mbHome: "Home", mbBoats: "Boats", mbDest: "Ports", mbContact: "Contact",
  searchAria: "Boat search", location: "Location", boatType: "Boat type", all: "All", date: "Date", searchBoats: "Search boats",
  popular: "Popular:", country: "Türkiye",
  heroTitle: "Charter your dream blue voyage",
  heroSubtitle: "Discover gulets, motor yachts, catamarans and sailing yachts, and send your reservation request.",
  byType: "Browse by boat type",
  featuredEyebrow: "Featured boats", featuredTitle: "Our picks for you", allBoatsBtn: "All boats",
  sampleHome: "Sample content: sample boats are shown because the database is not connected.",
  noBoatsHome: "No boats are listed yet. They will be here very soon.",
  howEyebrow: "How it works", howTitle: "Send your request in three steps",
  steps: [
    ["1", "Choose your boat", "Filter boats by region, dates, number of guests and budget."],
    ["2", "Send your request", "Create a reservation request with your dates and guest count. Requests are free."],
    ["3", "Wait for confirmation", "Availability and price are confirmed. The reservation is final only after confirmation."],
  ],
  destEyebrow: "Ports", destTitle: "Popular boat charter ports", seeAll: "See all",
  modesEyebrow: "Charter options", modesTitle: "Plan it your way",
  modes: [
    ["Day charter", "For bay tours, birthdays and private events."],
    ["Weekly charter", "Cabin cruises on a blue voyage: options with captain and crew included."],
    ["Luxury yacht collection", "Top-tier yachts with tailor-made routes and service."],
  ],
  seeBoats: "See boats →",
  routesEyebrow: "Blue voyage", routesTitle: "Classic routes",
  routes: [
    ["Göcek – 12 Islands", "7 days", "Tersane, Cleopatra, Kapı Creek"],
    ["Bodrum – Datça", "7 days", "Karaada, Knidos, Gökova"],
    ["Fethiye – Kekova", "7 days", "Kaş, Kekova, Kaleköy"],
  ],
  whyEyebrow: "Why yatpaketi?", whyTitle: "Choose with confidence, sail with ease",
  why: [
    ["Selected fleet", "We review and list our boats one by one."],
    ["Transparent process", "Your reservation request is not a confirmed booking; it is final only after confirmation."],
    ["Local expertise", "A team that knows the region for route and bay suggestions."],
    ["Close support", "Quick contact by phone and WhatsApp."],
  ],
  blogEyebrow: "Yatpaketi Guide", blogTitle: "Read, then plan", allPosts: "All articles",
  footTag: "Yacht and boat charter platform in Türkiye.", customerLogin: "Customer Login", rights: "All rights reserved.",
  captained: "Crewed", askPrice: "Ask for price", guestsN: (n) => `${n} guests`, cabinsN: (n) => `${n} cabins`,
  perWeek: "/ week from", perDay: "/ day from",
  listEyebrow: "Boats for Charter", listTitle: "Find the Right Boat for You",
  datesNote: "Results are not filtered by date. Availability is confirmed after your request.",
  fDest: "Port", fType: "Boat type", fGuests: "Guests (min.)", fCabins: "Cabins (min.)", fMin: "Min. price", fMax: "Max. price",
  fLength: "Length (min., m)", fYear: "Year built (min.)", fRental: "Charter type", fBoth: "Daily and weekly", fDaily: "Daily", fWeekly: "Weekly",
  fCaptain: "Captain", fAny: "Any", fWithCaptain: "With captain", fNoCaptain: "Without captain", fCrew: "Crew", fWithCrew: "Crewed", fNoCrew: "No crew",
  fSort: "Sort by", sRec: "Recommended", sPriceAsc: "Lowest price", sPriceDesc: "Highest price", sNew: "Newest", sLength: "Boat length",
  filter: "Filter", clear: "Clear",
  priceNote: "The price filter works in EUR on the weekly price (or the daily price if daily charter is selected). It cannot be applied to “Ask for price” boats.",
  foundN: (n) => `${n} ${n === 1 ? "boat" : "boats"} found`, noneYet: "No boats are listed yet.", noMatch: "No boats match these filters. Try loosening the filters.",
  breadcrumb: "Breadcrumb", sendRequest: "Send request", photoN: (n) => `photo ${n}`, sampleBoat: "Sample content: a sample boat is shown because the database is not connected.",
  about: "About this boat", specs: "Specifications", notStated: "Not specified",
  sType: "Boat type", sBrand: "Make / model", sYear: "Year built", sRefit: "Refit year", sLen: "Length", sWidth: "Beam", sCabins: "Cabins", sCap: "Guest capacity",
  sCrew: "Crew", crewN: (n) => `${n} ${n === 1 ? "person" : "people"}`, noCrew: "No crew", sCaptain: "Captain", included: "Included", notIncluded: "Not included",
  sPort: "Departure port", sRegions: "Charter regions",
  equipment: "Equipment", toys: "Water toys & sports equipment", availability: "Availability",
  availText: "Availability and the final price are confirmed after your reservation request. You can send your dates from the request card.",
  price: "Price", dailyPrice: "Daily", requestTitle: "Send a reservation request", similar: "Similar boats",
  rental: "Charter", titleSuffix: "Charter",
  pickDates: "Please select your check-in and check-out dates.", endBefore: "The end date cannot be before the start date.",
  waGreeting: (b) => `Hello, I would like to send a reservation request for ${b}.`,
  waDate: "Dates", waGuests: "Guests", waName: "Name", waBoat: "Boat",
  guestCount: "Guests", lessGuests: "Decrease guests", moreGuests: "Increase guests",
  yourNameOpt: "Your name (optional)", sendWa: "Send request via WhatsApp",
  waHelp: "A ready message opens in WhatsApp; you can edit it before sending. Your request is not a confirmed booking; availability and price are confirmed.",
  noWa: "No WhatsApp? Fill in the form",
  received: "Your request has been received.", receivedNote: "This is not a confirmed booking. We will contact you once availability and price are confirmed.",
  formAria: (b) => `${b} reservation request`, fullName: "Full name *", phone: "Phone", email: "Email", contactNote: "Please enter at least a phone number or an email.",
  guestsReq: "Guests *", message: "Message", consent: "I agree that my details may be processed by yatpaketi to respond to this request.",
  sending: "Sending…", submit: "Send Reservation Request", formNote: "Your request does not create a confirmed booking. The reservation is final once availability and price are confirmed.",
  routePick: "Choose Your Route", boatsCount: (n) => `${n} ${n === 1 ? "boat" : "boats"}`,
  destHero: (n) => `${n} Boat Charter`, destBoats: (n) => `Boats departing from ${n}`, destNone: "No boats have been added for this port yet.",
  sampleData: "Sample content: sample data is shown because the database is not connected.",
  catHero: (n) => `${n} Charter`, catBoats: (n) => `${n} boats`, catNone1: "There are no boats of this type listed yet.", catNone2: "Browse all boats", catNone3: "instead.",
  checkIn: "Check-in", checkOut: "Check-out", applyDates: "Done", prevMonth: "Previous month", nextMonth: "Next month", pickBoth: "Select check-in and check-out dates", pickEnd: "select check-out date",
  tapEnd: "Now tap the check-out date.", tapStart: "Tap the check-in date first, then the check-out date.",
  call: "Call", contactAria: "Contact", reachUs: "Get in touch", sendEmail: "Send email", writeUs: "Write to us", closeContact: "Close contact menu", openContact: "Open contact menu",
};

export const dict = { tr, en };
export type Dict = typeof tr;
export const t = (lang: Lang): Dict => dict[lang];
