# Yatpaketi AI Office

Sekiz uzman ajanın masası olan izometrik ofis ve arkasındaki görev yürütme motoru. Müşteri sitesinden (depo kökündeki Next.js uygulaması) bağımsız çalışır: ayrı `package.json`, ayrı port, ayrı veritabanı. Site koduna, Supabase'e ve Vercel yayınına dokunmaz.

## Çalıştırma

Node 20 ya da üstü gerekir.

```bash
cd ai-office
npm install
cp .env.example .env.local   # isteğe bağlı; boş bırakılırsa yerel modda açılır
npm run dev                  # http://localhost:3100
```

Yayın derlemesi: `npm run build && npm start`.

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu, port 3100 |
| `npm run build` / `npm start` | Yayın derlemesi ve sunucusu |
| `npm run typecheck` | TypeScript kontrolü |
| `npm run lint` | ESLint |
| `npm test` | Birim ve yürütme motoru testleri (API harcaması yapmaz) |
| `npm run test:claude-smoke` | Claude adaptörünü geçersiz anahtarla başlatıp hata yolunu doğrular |

## İki mod

Hangi modda olduğunuz üst çubukta ve her görev kartında yazar.

**Yerel mod** (`ANTHROPIC_API_KEY` boş). Dil modeli yoktur. Masalar depo üzerinde gerçek ama sabit denetimler çalıştırır ve yalnızca ölçtüğünü raporlar; görev metni yorumlanmaz ve bu her raporun başında yazar.

| Masa | Yerel modda yaptığı |
| --- | --- |
| Çapa (yacht-data-agent) | `icerik/tekneler.json`: eksik alan, tutarsızlık, kopya, fotoğraf sayısı |
| Mercan (seo-agent) | Sayfalarda metadata, canonical, hreflang, JSON-LD varlığı |
| Fener (security-qa-agent) | Gizli anahtar deseni, istemciye sızan anahtar, yetkisiz yönetim eylemi taraması |
| Derin (frontend-agent) | Bileşen envanteri, `alt` eksikleri, TR/EN/RU sayfa eşleşmesi |
| Poyraz (backend-agent) | SQL tablo ve RLS envanteri, sunucu eylemleri, ortam değişkeni adları |
| Kaptan (master-agent) | Anahtar kelimeyle uzmanlara yönlendirir, raporları alt alta birleştirir |
| Pusula (competitor-agent), Yakamoz (meta-agent) | Çalışmaz; görev "Başarısız" olur ve hangi entegrasyonun gerektiğini söyler |

**Gerçek mod** (`ANTHROPIC_API_KEY` dolu). Görevler [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/typescript) ile sunucuda yürütülür. API kullanımı Anthropic hesabınıza faturalanır; her görev için tur sayısı, token ve tahmini maliyet kaydedilir. `AI_OFFICE_MAX_BUDGET_USD` görev başına tavandır.

## Güvenlik sınırları

- Ajan, sunucunun başlattığı bir alt süreçte çalışır. Tarayıcıya kabuk, dosya ya da anahtar verilmez; hiçbir ortam değişkeni `NEXT_PUBLIC_` değildir.
- Her araç çağrısı iki kapıdan geçer (`src/server/adapters/claude.ts`): ajanın tanımında olmayan araç reddedilir; `Edit`, `Write` ve `Bash` her seferinde ekranda onayınızı bekler; `.env*`, `.git` ve depo dışı yollar okunamaz.
- Alt sürece yalnızca Anthropic anahtarı ve temel sistem değişkenleri geçer. Meta token'ı ve ofis parolası geçmez.
- Depodaki ya da kullanıcıdaki Claude ayarları, kancaları ve izinleri yüklenmez (`settingSources: []`).
- Deploy, yayınlama, e-posta, reklam harcaması ve veritabanı işlemi için araç tanımlı değildir. Meta bağlantısı salt okunurdur.
- Parola tanımlı değilse ofis yalnızca aynı makineden açılır. Uzaktan erişimde `AI_OFFICE_PASSWORD` ve `AI_OFFICE_SESSION_SECRET` zorunludur; oturum imzalı, `HttpOnly`, `SameSite=Strict` çerezdir ve durum değiştiren isteklerde kaynak kontrolü yapılır.

Onaylanan bir `Bash` komutu sunucu kullanıcısının yetkileriyle çalışır. Ofisi internete açacaksanız ayrı, yetkisi kısıtlı bir kullanıcı ya da konteyner içinde ve HTTPS arkasında çalıştırın.

## Mimari

```
tarayıcı                         sunucu (Next.js route handler'lar)
────────                         ──────────────────────────────────
OfficeScene  (izometrik SVG)     /api/jobs, /api/jobs/:id/{cancel,retry,approval}
DeskPanel    (sohbet, onay)  ──► Runner  (kuyruk, eşzamanlılık, onay, iptal, yeniden deneme)
Board        (pano, raporlar)        │
useOffice    (fetch + SSE)   ◄── /api/events (SSE)  ◄── bus ◄── Store (SQLite: jobs, job_events)
                                     │
                                     ├─ adapters/local.ts   yerel denetimler
                                     └─ adapters/claude.ts  Claude Agent SDK
```

- Görsel katman (`src/components`, `src/shared/office.ts`) durum üretmez; masadaki her durum sunucudaki görev kaydından gelir. "Çalışıyor" animasyonu yalnızca gerçekten yürüyen bir iş varken oynar.
- Ajan tanımlarının tek kaynağı depo kökündeki `.claude/agents/*.md` dosyalarıdır. Aynı dosyaları Claude Code da alt ajan olarak kullanır. Araç listesini oradan daraltabilirsiniz; ofis, tanımda yazsa bile `Read, Glob, Grep, WebSearch, WebFetch, Edit, Write, Bash` dışında araç vermez.
- Görev durumları: `queued`, `working`, `approval_required`, `completed`, `failed`, `cancelled`. Masa, aktif işi yoksa `idle` görünür.
- `POST /api/jobs` `Idempotency-Key` başlığını kabul eder; aynı anahtar ikinci bir iş açmaz. Geçici hatalar (hız sınırı, aşırı yük, ağ) artan bekleme ile en fazla 3 kez denenir. Sunucu yeniden başlarsa yarım kalan işler "Başarısız" işaretlenir, sıradakiler yürütülür.
- Veri `ai-office/data/ai-office.db` dosyasındadır (git'e girmez). Silmek tüm görev geçmişini siler.

## Barındırma

Uzun süren görevler ve SSE için sürekli çalışan bir Node süreci gerekir (VPS, Fly.io, Railway, Render, kendi sunucunuz). Vercel gibi sunucusuz ortamlara uygun değildir: süreç içi kuyruk ve SQLite dosyası istekler arasında korunmaz. Tek süreç olarak çalıştırın; birden fazla kopya aynı kuyruğu paylaşmaz.

## Entegrasyon bekleyenler

- **Gerçek mod uçtan uca**: adaptör yazıldı ve geçersiz anahtarla hata yolu doğrulandı; geçerli bir `ANTHROPIC_API_KEY` ile tam bir görev henüz çalıştırılmadı.
- **Meta Marketing API**: `meta_insights` aracı (salt okunur, kampanya düzeyi) yazıldı, gerçek hesapla denenmedi. `ads_read` izinli token ve reklam hesabı kimliği gerekir.
- **Rakip siteleri**: alan adları sabitlenmedi; competitor-agent her görevde resmi siteyi arama ile doğrular.
- **Canlı veritabanı**: hiçbir ajan Supabase'e bağlanmaz. Tekne denetimi depodaki `icerik/tekneler.json` dosyasını yansıtır.
