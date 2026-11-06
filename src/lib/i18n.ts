export type Lang = "tr" | "en" | "ru";
export const LANGS: Lang[] = ["tr", "en", "ru"];

// İngilizce sayfalar /en, Rusça sayfalar /ru altındadır; adresler (yat, bölge adresleri) Türkçe ile aynıdır.
export function href(lang: Lang, path: string): string {
  if (lang === "tr") return path;
  const p = `/${lang}`;
  if (path === "/") return p;
  if (path.startsWith("/#")) return `${p}${path.slice(1)}`;
  return `${p}${path}`;
}

export function langFromPath(path: string): Lang {
  for (const l of ["en", "ru"] as const) if (path === `/${l}` || path.startsWith(`/${l}/`) || path.startsWith(`/${l}#`)) return l;
  return "tr";
}

// Bulunulan sayfanın diğer dildeki karşılığı.
const EN_PAGES = ["/tekneler", "/limanlar", "/tekne-tipleri", "/rehber", "/destinasyonlar", "/rotalar", "/tur-paketleri", "/kiralama-sureci", "/sss", "/yat-ve-yatcilik-kulturu", "/hakkimizda", "/iletisim", "/favorilerim", "/tekne-karsilastir", "/hizmetlerimiz"];
export function switchPath(path: string, to: Lang): string {
  const cur = langFromPath(path);
  const bare = cur === "tr" ? path : path === `/${cur}` ? "/" : path.slice(cur.length + 1);
  if (to === "tr") return bare;
  // Karşılığı olmayan sayfalardan (blog vb.) o dilin ana sayfasına gidilir.
  const ok = bare === "/" || EN_PAGES.some((p) => bare === p || bare.startsWith(p + "/"));
  return ok ? href(to, bare) : `/${to}`;
}

const tr = {
  locale: "tr-TR",
  months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  days: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
  // menü
  navHome: "Ana Sayfa", navBoats: "Kiralık Yatlar", navAllBoats: "Tüm yatlar", navDest: "Limanlar", navAllDest: "Tüm limanlar",
  navGuide: "Yatpaketi Rehberi", navBlueVoyage: "Mavi Yolculuk", navBlog: "Blog", navAbout: "Hakkımızda", navServices: "Hizmetlerimiz", navContact: "İletişim",
  langGroup: "Dil seçimi", mainMenu: "Ana menü", mobileMenu: "Mobil menü", menuOpen: "Menüyü aç", menuClose: "Menüyü kapat", homeAria: "yatpaketi ana sayfa",
  // mobil çubuk
  quickMenu: "Hızlı menü", mbHome: "Ana sayfa", mbBoats: "Yatlar", mbDest: "Limanlar", mbContact: "İletişim", mbFav: "Favoriler",
  // arama
  searchAria: "Yat arama", location: "Lokasyon", boatType: "Yat tipi", all: "Tümü", date: "Tarih", searchBoats: "Yatları ara",
  popular: "Popüler:", country: "Türkiye",
  // ana sayfa
  heroTitle: "Hayalinizdeki mavi yolculuğu kiralayın",
  heroSubtitle: "Gulet, motoryat, katamaran ve yelkenli seçeneklerini keşfedin, rezervasyon talebinizi iletin.",
  byType: "Yat tipine göre keşfedin",
  featuredEyebrow: "Öne çıkan yatlar", featuredTitle: "Sizin için seçtiklerimiz", allBoatsBtn: "Tüm yatlar",
  sampleHome: "Örnek içerik: Veritabanı bağlı olmadığı için örnek yatlar gösteriliyor.",
  noBoatsHome: "Henüz yayında yat yok. Çok yakında burada olacak.",
  howEyebrow: "Nasıl çalışır?", howTitle: "Üç adımda talebinizi iletin",
  steps: [
    ["1", "Yatı seçin", "Bölge, tarih, kişi sayısı ve bütçenize göre yatları filtreleyin."],
    ["2", "Talebinizi iletin", "Tarih ve kişi sayınızla rezervasyon talebi oluşturun. Talep ücretsizdir."],
    ["3", "Onayı bekleyin", "Müsaitlik ve fiyat teyit edilir. Rezervasyon, onaydan sonra kesinleşir."],
  ] as string[][],
  destEyebrow: "Limanlar", destTitle: "Popüler yat kiralama limanları", seeAll: "Hepsini gör",
  modesEyebrow: "Kiralama seçenekleri", modesTitle: "İhtiyacınıza göre planlayın",
  modes: [
    ["Günlük kiralama", "Koy turları, doğum günü ve özel organizasyonlar için."],
    ["Haftalık kiralama", "Kabinli mavi yolculuk: kaptan ve mürettebat dahil seçenekler."],
    ["Lüks yat koleksiyonu", "Üst segment yatlar, kişiye özel rota ve hizmet."],
  ] as string[][],
  seeBoats: "Yatları gör →",
  routesEyebrow: "Mavi yolculuk", routesTitle: "Klasik rotalar",
  routes: [
    ["Göcek – 12 Ada", "7 gün", "Tersane, Cleopatra, Kapı Creek"],
    ["Bodrum – Datça", "7 gün", "Karaada, Knidos, Gökova"],
    ["Fethiye – Kekova", "7 gün", "Kaş, Kekova, Kaleköy"],
  ] as string[][],
  whyEyebrow: "Neden yatpaketi?", whyTitle: "Güvenle seçin, rahatça tatil yapın",
  why: [
    ["Seçilmiş filo", "Yatları tek tek inceleyip listeliyoruz."],
    ["Şeffaf süreç", "Rezervasyon talebiniz kesin rezervasyon değildir; onay sonrası netleşir."],
    ["Yerel uzmanlık", "Rota ve koy önerilerinde bölgeyi bilen ekip."],
    ["Yakın destek", "Telefon ve WhatsApp ile hızlı iletişim."],
  ] as string[][],
  blogEyebrow: "Yatpaketi Rehberi", blogTitle: "Okuyun, planlayın", allPosts: "Tüm yazılar",
  footTag: "Türkiye’de yat ve yat kiralama platformu.", customerLogin: "Müşteri Girişi", rights: "Tüm hakları saklıdır.",
  // yat kartı
  captained: "Mürettebatlı", askPrice: "Fiyat sorunuz", guestsN: (n: number) => `${n} misafir`, cabinsN: (n: number) => `${n} kabin`,
  perWeek: "/ hafta’dan", perDay: "/ gün’den",
  // liste sayfası
  listEyebrow: "Kiralık Yatlar", listTitle: "Size Uygun Yatı Bulun",
  datesNote: "Sonuçlar tarihe göre filtrelenmez. Müsaitlik, talebiniz sonrasında teyit edilir.",
  fDest: "Liman", fType: "Yat tipi", fGuests: "Misafir (en az)", fCabins: "Kabin (en az)", fMin: "En düşük fiyat", fMax: "En yüksek fiyat",
  fLength: "Uzunluk (en az, m)", fYear: "Yapım yılı (en az)", fRental: "Kiralama", fBoth: "Günlük ve haftalık", fDaily: "Günlük", fWeekly: "Haftalık",
  fCaptain: "Kaptan", fAny: "Fark etmez", fWithCaptain: "Kaptanlı", fNoCaptain: "Kaptansız", fCrew: "Mürettebat", fWithCrew: "Mürettebatlı", fNoCrew: "Mürettebatsız",
  fSort: "Sıralama", sRec: "Önerilen", sPriceAsc: "En düşük fiyat", sPriceDesc: "En yüksek fiyat", sNew: "En yeni eklenen", sLength: "Yat uzunluğu",
  filter: "Filtrele", clear: "Temizle",
  priceNote: "Fiyat filtresi EUR olarak, yatın en düşük günlük fiyatı üzerinden çalışır. “Fiyat sorunuz” yatlarında fiyat filtresi uygulanamaz.",
  foundN: (n: number) => `${n} yat bulundu`, noneYet: "Henüz yayında yat yok.", noMatch: "Bu filtrelere uygun yat bulunamadı. Filtreleri gevşetmeyi deneyin.",
  // yat sayfası
  breadcrumb: "Sayfa yolu", sendRequest: "Talep gönder", photoN: (n: number) => `fotoğraf ${n}`, sampleBoat: "Örnek içerik: Veritabanı bağlı olmadığı için örnek yat gösteriliyor.",
  about: "Yat hakkında", specs: "Teknik özellikler", notStated: "–",
  sType: "Yat tipi", sBrand: "Marka / model", sYear: "Yapım yılı", sRefit: "Yenileme yılı", sLen: "Uzunluk", sWidth: "Genişlik", sCabins: "Kabin", sCap: "Misafir kapasitesi",
  sCrew: "Mürettebat", crewN: (n: number) => `${n} kişi`, noCrew: "Mürettebatsız", sCaptain: "Kaptan", included: "Dahil", notIncluded: "Dahil değil",
  sPort: "Kalkış limanı", sRegions: "Kiralama bölgeleri",
  equipment: "Donanımlar", toys: "Su sporları ekipmanları", availability: "Müsaitlik",
  availText: "Müsaitlik ve kesin fiyat, rezervasyon talebiniz sonrasında teyit edilir. Tarihlerinizi talep kartından iletebilirsiniz.",
  price: "Fiyat", dailyPrice: "Günlük", requestTitle: "Rezervasyon talebi gönderin", similar: "Benzer yatlar",
  rental: "Kiralama", titleSuffix: "Kiralama",
  // talep formları
  pickDates: "Lütfen giriş ve çıkış tarihini seçin.", endBefore: "Çıkış tarihi giriş tarihinden önce olamaz.",
  waGreeting: (b: string) => `Merhaba, ${b} yatı için rezervasyon talebi iletmek istiyorum.`,
  waDate: "Tarih", waGuests: "Misafir sayısı", waName: "Ad soyad", waBoat: "Yat",
  guestCount: "Misafir sayısı", lessGuests: "Misafir sayısını azalt", moreGuests: "Misafir sayısını artır",
  yourNameOpt: "Adınız (isteğe bağlı)", sendWa: "WhatsApp ile talep gönder",
  waHelp: "Hazır mesaj WhatsApp’ta açılır, göndermeden önce düzenleyebilirsiniz. Talebiniz kesin rezervasyon değildir; müsaitlik ve fiyat teyit edilir.",
  noWa: "WhatsApp kullanmıyorsanız formu doldurun",
  received: "Talebiniz alındı.", receivedNote: "Bu bir kesin rezervasyon değildir. Müsaitlik ve fiyat teyit edildikten sonra sizinle iletişime geçeceğiz.",
  formAria: (b: string) => `${b} rezervasyon talebi`, fullName: "Ad soyad *", phone: "Telefon", email: "E-posta", contactNote: "Telefon veya e-postadan en az birini yazın.",
  guestsReq: "Misafir sayısı *", message: "Mesaj", consent: "Bilgilerimin, bu talebi yanıtlamak amacıyla yatpaketi tarafından işlenmesini kabul ediyorum.",
  sending: "Gönderiliyor…", submit: "Rezervasyon Talebi Gönder", formNote: "Talebiniz kesin rezervasyon oluşturmaz. Müsaitlik ve fiyat teyit edildikten sonra rezervasyon kesinleşir.",
  // keşfet sayfaları
  routePick: "Rotanızı Seçin", boatsCount: (n: number) => `${n} yat`,
  destHero: (n: string) => `${n} Yat Kiralama`, destBoats: (n: string) => `${n} çıkışlı yatlar`, destNone: "Bu liman için henüz yat eklenmedi.",
  sampleData: "Örnek içerik: Veritabanı bağlı olmadığı için örnek veri gösteriliyor.",
  catHero: (n: string) => `${n} Kiralama`, catBoats: (n: string) => `${n} yatları`, catNone1: "Bu tipte henüz yayında yat yok.", catNone2: "Tüm yatları", catNone3: "inceleyebilirsiniz.",
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
  navGuide: "Yatpaketi Guide", navBlueVoyage: "Blue Voyage", navBlog: "Blog", navAbout: "About us", navServices: "Our services", navContact: "Contact",
  langGroup: "Language", mainMenu: "Main menu", mobileMenu: "Mobile menu", menuOpen: "Open menu", menuClose: "Close menu", homeAria: "yatpaketi home",
  quickMenu: "Quick menu", mbHome: "Home", mbBoats: "Boats", mbDest: "Ports", mbContact: "Contact", mbFav: "Saved",
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
  priceNote: "The price filter works in EUR on the yacht's lowest daily price. It cannot be applied to “Ask for price” yachts.",
  foundN: (n) => `${n} ${n === 1 ? "boat" : "boats"} found`, noneYet: "No boats are listed yet.", noMatch: "No boats match these filters. Try loosening the filters.",
  breadcrumb: "Breadcrumb", sendRequest: "Send request", photoN: (n) => `photo ${n}`, sampleBoat: "Sample content: a sample boat is shown because the database is not connected.",
  about: "About this boat", specs: "Specifications", notStated: "–",
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


const ru: typeof tr = {
  locale: "ru-RU",
  months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  days: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  navHome: "Главная", navBoats: "Яхты в аренду", navAllBoats: "Все яхты", navDest: "Порты", navAllDest: "Все порты",
  navGuide: "Гид Yatpaketi", navBlueVoyage: "Голубой круиз", navBlog: "Блог", navAbout: "О нас", navServices: "Услуги", navContact: "Контакты",
  langGroup: "Выбор языка", mainMenu: "Главное меню", mobileMenu: "Мобильное меню", menuOpen: "Открыть меню", menuClose: "Закрыть меню", homeAria: "главная страница yatpaketi",
  quickMenu: "Быстрое меню", mbHome: "Главная", mbBoats: "Яхты", mbDest: "Порты", mbContact: "Контакты", mbFav: "Избранное",
  searchAria: "Поиск яхт", location: "Локация", boatType: "Тип яхты", all: "Все", date: "Даты", searchBoats: "Найти яхты",
  popular: "Популярное:", country: "Турция",
  heroTitle: "Арендуйте голубой круиз своей мечты",
  heroSubtitle: "Гулеты, моторные яхты, катамараны и парусники — выберите яхту и отправьте запрос на бронирование.",
  byType: "Выберите по типу яхты",
  featuredEyebrow: "Избранные яхты", featuredTitle: "Мы выбрали для вас", allBoatsBtn: "Все яхты",
  sampleHome: "Пример: база данных не подключена, поэтому показаны примерные яхты.",
  noBoatsHome: "Яхты пока не опубликованы. Скоро они появятся здесь.",
  howEyebrow: "Как это работает?", howTitle: "Отправьте запрос в три шага",
  steps: [
    ["1", "Выберите яхту", "Фильтруйте яхты по региону, датам, количеству гостей и бюджету."],
    ["2", "Отправьте запрос", "Создайте запрос на бронирование с датами и количеством гостей. Это бесплатно."],
    ["3", "Дождитесь подтверждения", "Мы проверим наличие и цену. Бронирование окончательно после подтверждения."],
  ],
  destEyebrow: "Порты", destTitle: "Популярные порты для аренды яхт", seeAll: "Смотреть все",
  modesEyebrow: "Варианты аренды", modesTitle: "Спланируйте под себя",
  modes: [
    ["Аренда на день", "Для прогулок по бухтам, дней рождения и частных мероприятий."],
    ["Аренда на неделю", "Круиз с каютами: варианты с капитаном и экипажем."],
    ["Коллекция люкс-яхт", "Яхты премиум-класса, индивидуальный маршрут и сервис."],
  ],
  seeBoats: "Смотреть яхты →",
  routesEyebrow: "Голубой круиз", routesTitle: "Классические маршруты",
  routes: [
    ["Гёджек – 12 островов", "7 дней", "Терсане, Клеопатра, Капы Крик"],
    ["Бодрум – Датча", "7 дней", "Караада, Книдос, Гёкова"],
    ["Фетхие – Кекова", "7 дней", "Каш, Кекова, Калекёй"],
  ],
  whyEyebrow: "Почему yatpaketi?", whyTitle: "Выбирайте уверенно, отдыхайте спокойно",
  why: [
    ["Отобранный флот", "Мы проверяем и размещаем каждую яхту отдельно."],
    ["Прозрачный процесс", "Запрос — это ещё не бронирование; оно окончательно после подтверждения."],
    ["Знание региона", "Команда, которая знает побережье, подскажет маршрут и бухты."],
    ["Поддержка рядом", "Быстрая связь по телефону и в WhatsApp."],
  ],
  blogEyebrow: "Гид Yatpaketi", blogTitle: "Читайте и планируйте", allPosts: "Все статьи",
  footTag: "Платформа аренды яхт в Турции.", customerLogin: "Вход для клиентов", rights: "Все права защищены.",
  captained: "С экипажем", askPrice: "Цена по запросу", guestsN: (n) => `${n} гостей`, cabinsN: (n) => `${n} кают`,
  perWeek: "/ неделя от", perDay: "/ день от",
  listEyebrow: "Яхты в аренду", listTitle: "Найдите подходящую яхту",
  datesNote: "Результаты не фильтруются по датам. Наличие подтверждается после запроса.",
  fDest: "Порт", fType: "Тип яхты", fGuests: "Гости (мин.)", fCabins: "Каюты (мин.)", fMin: "Мин. цена", fMax: "Макс. цена",
  fLength: "Длина (мин., м)", fYear: "Год постройки (мин.)", fRental: "Тип аренды", fBoth: "На день и на неделю", fDaily: "На день", fWeekly: "На неделю",
  fCaptain: "Капитан", fAny: "Не важно", fWithCaptain: "С капитаном", fNoCaptain: "Без капитана", fCrew: "Экипаж", fWithCrew: "С экипажем", fNoCrew: "Без экипажа",
  fSort: "Сортировка", sRec: "Рекомендуемые", sPriceAsc: "Сначала дешевле", sPriceDesc: "Сначала дороже", sNew: "Новые", sLength: "Длина яхты",
  filter: "Фильтр", clear: "Очистить",
  priceNote: "Фильтр по цене работает в EUR по минимальной дневной цене яхты. К яхтам с ценой по запросу он не применяется.",
  foundN: (n) => `Найдено яхт: ${n}`, noneYet: "Яхты пока не опубликованы.", noMatch: "Нет яхт по этим фильтрам. Попробуйте ослабить фильтры.",
  breadcrumb: "Навигация", sendRequest: "Отправить запрос", photoN: (n) => `фото ${n}`, sampleBoat: "Пример: база данных не подключена, поэтому показана примерная яхта.",
  about: "О яхте", specs: "Характеристики", notStated: "–",
  sType: "Тип яхты", sBrand: "Марка / модель", sYear: "Год постройки", sRefit: "Год ремонта", sLen: "Длина", sWidth: "Ширина", sCabins: "Каюты", sCap: "Вместимость",
  sCrew: "Экипаж", crewN: (n) => `${n} чел.`, noCrew: "Без экипажа", sCaptain: "Капитан", included: "Включено", notIncluded: "Не включено",
  sPort: "Порт отправления", sRegions: "Регионы аренды",
  equipment: "Оборудование", toys: "Водные развлечения и снаряжение", availability: "Наличие",
  availText: "Наличие и окончательная цена подтверждаются после запроса. Даты можно указать в карточке запроса.",
  price: "Цена", dailyPrice: "За день", requestTitle: "Отправить запрос на бронирование", similar: "Похожие яхты",
  rental: "Аренда", titleSuffix: "Аренда",
  pickDates: "Пожалуйста, выберите даты заезда и выезда.", endBefore: "Дата выезда не может быть раньше даты заезда.",
  waGreeting: (b) => `Здравствуйте, я хочу отправить запрос на бронирование яхты ${b}.`,
  waDate: "Даты", waGuests: "Гости", waName: "Имя", waBoat: "Яхта",
  guestCount: "Гости", lessGuests: "Меньше гостей", moreGuests: "Больше гостей",
  yourNameOpt: "Ваше имя (необязательно)", sendWa: "Отправить запрос в WhatsApp",
  waHelp: "Готовое сообщение откроется в WhatsApp, перед отправкой его можно изменить. Запрос — это ещё не бронирование; наличие и цена будут подтверждены.",
  noWa: "Нет WhatsApp? Заполните форму",
  received: "Ваш запрос получен.", receivedNote: "Это ещё не бронирование. Мы свяжемся с вами после подтверждения наличия и цены.",
  formAria: (b) => `Запрос на бронирование ${b}`, fullName: "Имя и фамилия *", phone: "Телефон", email: "Эл. почта", contactNote: "Укажите хотя бы телефон или эл. почту.",
  guestsReq: "Гости *", message: "Сообщение", consent: "Я согласен(на) на обработку моих данных yatpaketi для ответа на этот запрос.",
  sending: "Отправка…", submit: "Отправить запрос", formNote: "Запрос не создаёт бронирование. Бронирование окончательно после подтверждения наличия и цены.",
  routePick: "Выберите маршрут", boatsCount: (n) => `Яхт: ${n}`,
  destHero: (n) => `Аренда яхт: ${n}`, destBoats: (n) => `Яхты с отправлением из ${n}`, destNone: "Для этого порта яхты пока не добавлены.",
  sampleData: "Пример: база данных не подключена, поэтому показаны примерные данные.",
  catHero: (n) => `${n} в аренду`, catBoats: (n) => `${n}`, catNone1: "Яхт этого типа пока нет.", catNone2: "Посмотрите", catNone3: "все яхты.",
  checkIn: "Заезд", checkOut: "Выезд", applyDates: "Готово", prevMonth: "Предыдущий месяц", nextMonth: "Следующий месяц", pickBoth: "Выберите даты заезда и выезда", pickEnd: "выберите дату выезда",
  tapEnd: "Теперь нажмите на дату выезда.", tapStart: "Сначала нажмите на дату заезда, затем на дату выезда.",
  call: "Позвонить", contactAria: "Контакты", reachUs: "Свяжитесь с нами", sendEmail: "Написать на почту", writeUs: "Написать нам", closeContact: "Закрыть меню контактов", openContact: "Открыть меню контактов",
};

export const dict = { tr, en, ru };
export type Dict = typeof tr;
export const t = (lang: Lang): Dict => dict[lang];
