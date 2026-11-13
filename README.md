# yatpaketi

Yat ve tekne kiralama platformu. Next.js (App Router), TypeScript, Tailwind CSS 4, Motion.

## Durum (Aşama 1)

- Ana sayfa: header, hero, arama alanı, destinasyonlar, örnek tekneler, kategoriler, kiralama seçenekleri, rotalar, neden yatpaketi, blog, destek alanı, footer.
- Tekneler, fiyatlar ve görseller GEÇİCİ örnek veridir (`src/lib/data.ts`). Aşama 3'te Supabase'e bağlanacak.
- Logo: yüklediğiniz logo `public/logo.png` olarak kullanılıyor (ekran görüntüsünden kırpıldı, düşük çözünürlüklü; yüksek çözünürlüklü PNG/SVG verirseniz değiştirilir).
- Arama formu henüz veritabanına bağlı değil (Aşama 2). TR/EN düğmesi henüz metin çevirmiyor (Aşama 5).
- Bu proje derleme ortamında test EDİLEMEDİ (paket kurulumuna ağ erişimi yoktu). İlk `npm run build` hatası çıkarsa bildirin.

## Yerelde çalıştırma (bilgisayarda)

```
npm install
npm run dev
```

## Teknoloji

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Motion. Yazı tipleri next/font ile (Fraunces, Inter). Henüz Supabase bağlantısı yok; ortam değişkeni gerekmez.

## Vercel ayarları

Framework Preset: Next.js (otomatik algılanır). Build Command, Output Directory ve Install Command varsayılan kalır. Node 20 veya üstü. Ortam değişkeni şimdilik gerekmez; alan adı bağlayınca `NEXT_PUBLIC_SITE_URL` değerini gerçek adresle ayarlayın.

## iPhone ile yayınlama (özet)

1. GitHub: github.com > yeni "yatpaketi" deposu (Private) > "uploading an existing file" ile proje dosyalarını yükleyin. `.env` dosyalarını yüklemeyin.
2. Vercel: vercel.com > GitHub ile giriş > Add New Project > yatpaketi deposunu seçin > Deploy. Her GitHub değişikliğinde site otomatik yenilenir.
3. Supabase (Aşama 3'te): supabase.com > New project > URL ve anon key'i Vercel > Settings > Environment Variables bölümüne ekleyin. `SUPABASE_SERVICE_ROLE_KEY` asla herkese açık olmamalı.

## Ticari kullanım notu

Vercel Hobby planı ticari kullanıma izin vermez; gerçek müşteri trafiği için Pro plan gerekir. Supabase ücretsiz planda projeler hareketsizlikte duraklatılabilir ve yedekleme sınırlıdır; canlı kullanımda Pro plan önerilir. Güncel limitler için vercel.com/pricing ve supabase.com/pricing sayfalarına bakın.

## AI Office (ayrı uygulama)

`ai-office/` klasörü, sekiz uzman ajanın izometrik ofis arayüzünü ve görev yürütme motorunu içeren bağımsız bir Next.js uygulamasıdır. Bu sitenin derlemesine dahil değildir (`tsconfig.json` içinde hariç tutulur), kendi bağımlılıkları ve kendi SQLite veritabanı vardır; Supabase'e ve Vercel yayınına dokunmaz.

```
cd ai-office
npm install
npm run dev
```

Adres: http://localhost:3100. Ayrıntılar: `ai-office/README.md`. Ajan tanımları: `.claude/agents/`.
