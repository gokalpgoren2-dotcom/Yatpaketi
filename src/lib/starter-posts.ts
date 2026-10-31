// Başlangıç taslakları. Panel > Yazılar > "Başlangıç taslaklarını ekle" ile TASLAK olarak eklenir; yayınlanmaz.
// Köşeli parantez [ ] içindeki yerler sizin işleyişinize göre doldurulmalıdır.

export type Starter = { kind: "guide" | "page"; slug: string; title: string; excerpt: string; sort: number; content: string };

const note = "**TASLAK:** Bu metin başlangıç taslağıdır. Yayınlamadan önce bu satırı silin, köşeli parantez [ ] içindeki yerleri ve bilgileri kendi işleyişinize göre düzeltin.";

export const STARTER_POSTS: Starter[] = [
  {
    kind: "guide", slug: "mavi-yolculuk-nedir", sort: 1,
    title: "Mavi Yolculuk Nedir?",
    excerpt: "Bir tekneyle koy koy dolaşılan tatilin nasıl işlediğini kısaca anlatıyoruz.",
    content: `${note}

Mavi yolculuk, Ege ve Akdeniz kıyılarında bir tekneyle koy koy dolaşarak yapılan, çoğunlukla kabinli ve haftalık bir tekne tatilidir. Her gün farklı bir koyda yüzer, tekneyi gezen bir otel gibi kullanırsınız.

## Nasıl işler?
- Tekneyi ve tarihleri seçer, rezervasyon talebinizi iletirsiniz.
- Müsaitlik ve fiyat teyit edildikten sonra rezervasyon kesinleşir.
- Tekneye belirlenen limanda yerleşirsiniz.
- Rota; hava ve deniz durumuna, kaptanın önerilerine ve isteklerinize göre şekillenir.
- Yolculuk, anlaşılan limanda sona erer.

## Kimler için uygun?
Aileler, arkadaş grupları ve çiftler için uygundur. Tekne tipi ve kabin sayısı, grubun büyüklüğüne göre seçilir.

## Hazırlık için küçük notlar
- Hava koşulları rotayı değiştirebilir; esnek olmak tatili rahatlatır.
- Güneş kremi, şapka, mayo ve rahat kıyafetler yeterlidir.
- Büyük, sert valizler yerine yumuşak çantalar teknede daha kolay yer bulur.

Size uygun tekneleri [tekne listesinde](/tekneler) inceleyebilirsiniz.`,
  },
  {
    kind: "guide", slug: "gulet-mi-katamaran-mi", sort: 2,
    title: "Gulet mi, Katamaran mı? Hangisi Size Uygun?",
    excerpt: "Tekne tiplerinin güçlü yanlarını karşılaştırıyoruz.",
    content: `${note}

Doğru tekne tipi; grubunuzun büyüklüğüne, bütçenize ve tatilden beklentinize göre değişir.

## Gulet
Ahşap gövdeli, geniş güverteli klasik mavi yolculuk teknesidir. Genellikle kabin sayısı fazladır ve kaptan ile mürettebat ile kiralanır. Kalabalık gruplar ve geleneksel bir deneyim isteyenler için uygundur.

## Katamaran
İki gövdeli olduğu için dengeli seyreder ve geniş bir ortak alan sunar. Küçük gruplar ve aileler için tercih edilir.

## Motoryat
Daha hızlı ilerler, kısa sürede çok koy görmeye uygundur. Konfor ve hız arayanlar için iyi bir seçenektir.

## Yelkenli
Rüzgârla ilerleme deneyimi isteyenler içindir. [Kaptanlı ve kaptansız seçenekleri tekne sayfasında belirtiyoruz.]

## Günübirlik tekne
Tek günlük koy turları, doğum günü ve özel organizasyonlar için uygundur.

Kararsız kalırsanız tarih ve kişi sayınızı bize yazın, size uygun seçenekleri önerelim.`,
  },
  {
    kind: "guide", slug: "kumanya-yemek-icecek", sort: 3,
    title: "Mavi Yolculukta Kumanya, Yemek ve İçecek",
    excerpt: "Teknede yemek düzeninin genel olarak nasıl işlediği.",
    content: `${note}

Yemek düzeni tekneye ve kiralama türüne göre değişir. Bu yüzden her teknenin sayfasındaki bilgiyi ve teklifimizi kontrol edin.

## Genel işleyiş
- Bazı teknelerde yemek servisi kiralamaya dahildir, bazılarında kumanya ayrıca hazırlanır.
- [Bizim işleyişimiz: Kumanya ve yemek düzeni nasıl planlanıyor? Buraya yazın.]
- Özel beslenme ihtiyaçlarınızı (vejetaryen, alerji vb.) rezervasyon talebinizde mutlaka belirtin.

## İçecekler
[İçeceklerin dahil olup olmadığını ve nasıl temin edildiğini buraya yazın.]

## İpucu
Kumanya listesini yolculuktan önce mürettebatla netleştirmek, tatil boyunca sürprizleri azaltır.`,
  },
  {
    kind: "guide", slug: "tekne-murettebati", sort: 4,
    title: "Tekne Mürettebatı: Kaptan, Aşçı ve Hostes Ne Yapar?",
    excerpt: "Kaptanlı kiralamada teknedeki ekibin görevleri.",
    content: `${note}

Kaptanlı kiralamalarda tekne, deneyimli bir ekiple gelir. Ekip sayısı tekne büyüklüğüne göre değişir.

## Kaptan
Teknenin güvenliğinden, rotadan ve seyirden sorumludur. Hava durumuna göre rotayı sizinle birlikte planlar.

## Aşçı
Yemek hazırlığını yapar. [Menü ve yemek düzeni konusunda sizin işleyişinizi buraya yazın.]

## Güverte görevlisi ve hostes
Bağlama, demirleme, tekne bakımı ve misafir hizmetlerinde yardımcı olur.

## Bahşiş
[Bahşiş konusundaki yaklaşımınızı isterseniz buraya yazın.]

Tekne sayfasında her teknenin mürettebat sayısını görebilirsiniz.`,
  },
  {
    kind: "guide", slug: "cocuklarla-tekne-kiralama", sort: 5,
    title: "Çocuklarla Tekne Kiralama",
    excerpt: "Çocuklu ailelerin tekne tatilinden önce düşünmesi gerekenler.",
    content: `${note}

Çocuklarla tekne tatili keyifli olabilir; birkaç hazırlık işi rahatlatır.

## Güvenlik
- Çocuklar için uygun boyda can yeleği bulundurun. [Teknelerde çocuk can yeleği bulunup bulunmadığını belirtin.]
- Güvertede ve merdivenlerde çocukları yalnız bırakmayın.
- Yüzme bilmeyen çocuklar için yüzerken yetişkin gözetimi şarttır.

## Konfor
- Güneş koruması (şapka, krem, hafif giysi) önemlidir.
- Kısa süreli seyirler ve bol yüzme molaları çocuklar için idealdir.

## Tekne seçimi
Geniş ortak alanı olan ve dengeli seyreden tekneler çocuklu aileler için rahattır. Misafir sayınızı ve çocukların yaşını rezervasyon talebinizde belirtin.`,
  },
  {
    kind: "guide", slug: "ozel-etkinlikler-icin-yat-kiralama", sort: 6,
    title: "Özel Etkinlikler İçin Yat Kiralama",
    excerpt: "Doğum günü, evlilik teklifi ve kutlamalar için tekne.",
    content: `${note}

Tekne; doğum günü, yıl dönümü, evlilik teklifi veya kurumsal buluşmalar için özel bir ortam sunar.

## Nasıl planlanır?
- Etkinlik tarihini, kişi sayısını ve süresini belirtin.
- Günübirlik koy turları çoğu etkinlik için yeterlidir.
- [Süsleme, pasta, müzik gibi ek hizmetler sunuyorsanız burada belirtin.]

## Dikkat edilecekler
- Tekne kapasitesini aşmayın.
- Hava koşulları için alternatif bir plan düşünün.

Etkinlik için bize yazın, uygun tekneleri önerelim.`,
  },
  {
    kind: "guide", slug: "teknede-uyulmasi-gereken-kurallar", sort: 7,
    title: "Teknede Uyulması Gereken Kurallar",
    excerpt: "Güvenli ve rahat bir yolculuk için genel kurallar.",
    content: `${note}

Kurallar tekneye göre değişebilir. Aşağıdakiler genel, yaygın uygulamalardır; kendi kurallarınıza göre düzenleyin.

- Kaptanın güvenlik talimatlarına uyun.
- Seyir sırasında güvertede dikkatli hareket edin.
- Yüzme ve su sporlarında kaptanın uyarılarını dikkate alın.
- Tekne tuvaletleri için tekne ekibinin anlattığı kullanım kurallarına uyun.
- Tekneye sert tabanlı ayakkabı ile çıkmayın. [Ayakkabı kuralınızı yazın.]
- Tekne içinde sigara ve açık ateş konusunda ekibin yönlendirmesine uyun.
- [Evcil hayvan, alkol, ses düzeni gibi kendi kurallarınızı ekleyin.]`,
  },
  {
    kind: "page", slug: "hakkimizda", sort: 0,
    title: "Hakkımızda",
    excerpt: "yatpaketi kimdir, nasıl çalışır.",
    content: `${note}

yatpaketi, Türkiye'de yat ve tekne kiralama için hazırlanmış bir platformdur.

## Biz kimiz?
[Firmanızın kısa hikâyesini yazın: kaç yıldır bu işte olduğunuz, hangi bölgelerde çalıştığınız, neyi önemsediğiniz.]

## Nasıl çalışıyoruz?
- Tekneleri tek tek inceleyip listeliyoruz. [Bu cümle doğruysa bırakın, değilse düzeltin.]
- Rezervasyon talebiniz kesin rezervasyon değildir; müsaitlik ve fiyat teyit edildikten sonra kesinleşir.
- WhatsApp, telefon veya e-posta ile bize ulaşabilirsiniz.

## İletişim
Ana sayfanın altındaki iletişim bilgilerinden veya sağ alttaki iletişim balonundan bize yazabilirsiniz.`,
  },
  {
    kind: "page", slug: "sik-sorulan-sorular", sort: 0,
    title: "Sık Sorulan Sorular",
    excerpt: "Rezervasyon ve kiralama hakkında kısa cevaplar.",
    content: `${note}

## Rezervasyon talebi göndermek ücretli mi?
Hayır. Talep göndermek ücretsizdir ve kesin rezervasyon oluşturmaz.

## Rezervasyon nasıl kesinleşir?
Talebiniz sonrası müsaitlik ve fiyat teyit edilir. [Kesinleşme ve ödeme koşullarınızı buraya yazın.]

## Kaptan kiraya dahil mi?
Teknenin sayfasında "Kaptan dahil" bilgisi yer alır.

## Yemek ve içecek dahil mi?
Tekneye ve kiralama türüne göre değişir. [Kendi işleyişinizi yazın.] Ayrıntı için [Yatpaketi Rehberi](/rehber) sayfasına bakabilirsiniz.

## İptal veya değişiklik yapabilir miyim?
[İptal ve değişiklik koşullarınızı buraya yazın.]

## Başka bir sorum var.
Sağ alttaki iletişim balonundan bize WhatsApp, telefon veya e-posta ile ulaşabilirsiniz.`,
  },
  {
    kind: "page", slug: "iptal-ve-iade-politikasi", sort: 0,
    title: "İptal ve İade Politikası",
    excerpt: "İptal, değişiklik ve iade koşulları.",
    content: `${note}

**ÖNEMLİ:** Bu sayfa sizin işletme koşullarınızı anlatmalıdır. Aşağıdaki başlıkları kendi koşullarınıza göre doldurun; hukuki geçerlilik için bir avukata danışın.

## Rezervasyonun kesinleşmesi
[Rezervasyonun ne zaman ve hangi koşulda kesinleştiğini yazın.]

## Ödeme
[Kapora, kalan ödeme ve ödeme yöntemleri.]

## İptal koşulları
[Kiralama tarihinden kaç gün önce yapılan iptalde ne kadar iade yapıldığını yazın.]

## Tarih değişikliği
[Tarih değişikliği koşulları.]

## Hava koşulları
[Olumsuz hava nedeniyle seyir yapılamazsa nasıl bir yol izlendiğini yazın.]`,
  },
];
