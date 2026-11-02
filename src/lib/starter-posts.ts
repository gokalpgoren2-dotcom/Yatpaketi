// Başlangıç taslakları. Panel > Yazılar > "Başlangıç taslaklarını ekle" ile TASLAK olarak eklenir; yayınlanmaz.
// Köşeli parantez [ ] içindeki yerler sizin işleyişinize göre doldurulmalıdır.

export type Starter = { kind: "guide" | "page"; slug: string; title: string; excerpt: string; sort: number; content: string };

const note = "**TASLAK:** Bu metin başlangıç taslağıdır. Yayınlamadan önce bu satırı silin, köşeli parantez [ ] içindeki yerleri ve bilgileri kendi işleyişinize göre düzeltin.";

export const STARTER_POSTS: Starter[] = [
  {
    kind: "guide", slug: "mavi-yolculuk-nedir", sort: 1,
    title: "Mavi Yolculuk Nedir?",
    excerpt: "Bir yatla koy koy dolaşılan tatilin nasıl işlediğini kısaca anlatıyoruz.",
    content: `${note}

Mavi yolculuk, Ege ve Akdeniz kıyılarında bir yatla koy koy dolaşarak yapılan, çoğunlukla kabinli ve haftalık bir yat tatilidir. Her gün farklı bir koyda yüzer, yatı gezen bir otel gibi kullanırsınız.

## Nasıl işler?
- Yatı ve tarihleri seçer, rezervasyon talebinizi iletirsiniz.
- Müsaitlik ve fiyat teyit edildikten sonra rezervasyon kesinleşir.
- Yata belirlenen limanda yerleşirsiniz.
- Rota; hava ve deniz durumuna, kaptanın önerilerine ve isteklerinize göre şekillenir.
- Yolculuk, anlaşılan limanda sona erer.

## Kimler için uygun?
Aileler, arkadaş grupları ve çiftler için uygundur. Yat tipi ve kabin sayısı, grubun büyüklüğüne göre seçilir.

## Hazırlık için küçük notlar
- Hava koşulları rotayı değiştirebilir; esnek olmak tatili rahatlatır.
- Güneş kremi, şapka, mayo ve rahat kıyafetler yeterlidir.
- Büyük, sert valizler yerine yumuşak çantalar yatta daha kolay yer bulur.

Size uygun yatları [yat listesinde](/tekneler) inceleyebilirsiniz.`,
  },
  {
    kind: "guide", slug: "gulet-mi-katamaran-mi", sort: 2,
    title: "Gulet mi, Katamaran mı? Hangisi Size Uygun?",
    excerpt: "Yat tiplerinin güçlü yanlarını karşılaştırıyoruz.",
    content: `${note}

Doğru yat tipi; grubunuzun büyüklüğüne, bütçenize ve tatilden beklentinize göre değişir.

## Gulet
Ahşap gövdeli, geniş güverteli klasik mavi yolculuk yatıdır. Genellikle kabin sayısı fazladır ve kaptan ile mürettebat ile kiralanır. Kalabalık gruplar ve geleneksel bir deneyim isteyenler için uygundur.

## Katamaran
İki gövdeli olduğu için dengeli seyreder ve geniş bir ortak alan sunar. Küçük gruplar ve aileler için tercih edilir.

## Motoryat
Daha hızlı ilerler, kısa sürede çok koy görmeye uygundur. Konfor ve hız arayanlar için iyi bir seçenektir.

## Yelkenli
Rüzgârla ilerleme deneyimi isteyenler içindir. [Kaptanlı ve kaptansız seçenekleri yat sayfasında belirtiyoruz.]

## Günübirlik yat
Tek günlük koy turları, doğum günü ve özel organizasyonlar için uygundur.

Kararsız kalırsanız tarih ve kişi sayınızı bize yazın, size uygun seçenekleri önerelim.`,
  },
  {
    kind: "guide", slug: "kumanya-yemek-icecek", sort: 3,
    title: "Mavi Yolculukta Kumanya, Yemek ve İçecek",
    excerpt: "Yatta yemek düzeninin genel olarak nasıl işlediği.",
    content: `${note}

Yemek düzeni yata ve kiralama türüne göre değişir. Bu yüzden her yatın sayfasındaki bilgiyi ve teklifimizi kontrol edin.

## Genel işleyiş
- Bazı yatlarda yemek servisi kiralamaya dahildir, bazılarında kumanya ayrıca hazırlanır.
- [Bizim işleyişimiz: Kumanya ve yemek düzeni nasıl planlanıyor? Buraya yazın.]
- Özel beslenme ihtiyaçlarınızı (vejetaryen, alerji vb.) rezervasyon talebinizde mutlaka belirtin.

## İçecekler
[İçeceklerin dahil olup olmadığını ve nasıl temin edildiğini buraya yazın.]

## İpucu
Kumanya listesini yolculuktan önce mürettebatla netleştirmek, tatil boyunca sürprizleri azaltır.`,
  },
  {
    kind: "guide", slug: "tekne-murettebati", sort: 4,
    title: "Yat Mürettebatı: Kaptan, Aşçı ve Hostes Ne Yapar?",
    excerpt: "Kaptanlı kiralamada yattaki ekibin görevleri.",
    content: `${note}

Kaptanlı kiralamalarda yat, deneyimli bir ekiple gelir. Ekip sayısı yat büyüklüğüne göre değişir.

## Kaptan
Yatın güvenliğinden, rotadan ve seyirden sorumludur. Hava durumuna göre rotayı sizinle birlikte planlar.

## Aşçı
Yemek hazırlığını yapar. [Menü ve yemek düzeni konusunda sizin işleyişinizi buraya yazın.]

## Güverte görevlisi ve hostes
Bağlama, demirleme, yat bakımı ve misafir hizmetlerinde yardımcı olur.

## Bahşiş
[Bahşiş konusundaki yaklaşımınızı isterseniz buraya yazın.]

Yat sayfasında her yatın mürettebat sayısını görebilirsiniz.`,
  },
  {
    kind: "guide", slug: "cocuklarla-tekne-kiralama", sort: 5,
    title: "Çocuklarla Yat Kiralama",
    excerpt: "Çocuklu ailelerin yat tatilinden önce düşünmesi gerekenler.",
    content: `${note}

Çocuklarla yat tatili keyifli olabilir; birkaç hazırlık işi rahatlatır.

## Güvenlik
- Çocuklar için uygun boyda can yeleği bulundurun. [Yatlarda çocuk can yeleği bulunup bulunmadığını belirtin.]
- Güvertede ve merdivenlerde çocukları yalnız bırakmayın.
- Yüzme bilmeyen çocuklar için yüzerken yetişkin gözetimi şarttır.

## Konfor
- Güneş koruması (şapka, krem, hafif giysi) önemlidir.
- Kısa süreli seyirler ve bol yüzme molaları çocuklar için idealdir.

## Yat seçimi
Geniş ortak alanı olan ve dengeli seyreden yatlar çocuklu aileler için rahattır. Misafir sayınızı ve çocukların yaşını rezervasyon talebinizde belirtin.`,
  },
  {
    kind: "guide", slug: "ozel-etkinlikler-icin-yat-kiralama", sort: 6,
    title: "Özel Etkinlikler İçin Yat Kiralama",
    excerpt: "Doğum günü, evlilik teklifi ve kutlamalar için yat.",
    content: `${note}

Yat; doğum günü, yıl dönümü, evlilik teklifi veya kurumsal buluşmalar için özel bir ortam sunar.

## Nasıl planlanır?
- Etkinlik tarihini, kişi sayısını ve süresini belirtin.
- Günübirlik koy turları çoğu etkinlik için yeterlidir.
- [Süsleme, pasta, müzik gibi ek hizmetler sunuyorsanız burada belirtin.]

## Dikkat edilecekler
- Yat kapasitesini aşmayın.
- Hava koşulları için alternatif bir plan düşünün.

Etkinlik için bize yazın, uygun yatları önerelim.`,
  },
  {
    kind: "guide", slug: "teknede-uyulmasi-gereken-kurallar", sort: 7,
    title: "Yatta Uyulması Gereken Kurallar",
    excerpt: "Güvenli ve rahat bir yolculuk için genel kurallar.",
    content: `${note}

Kurallar yata göre değişebilir. Aşağıdakiler genel, yaygın uygulamalardır; kendi kurallarınıza göre düzenleyin.

- Kaptanın güvenlik talimatlarına uyun.
- Seyir sırasında güvertede dikkatli hareket edin.
- Yüzme ve su sporlarında kaptanın uyarılarını dikkate alın.
- Yat tuvaletleri için yat ekibinin anlattığı kullanım kurallarına uyun.
- Yata sert tabanlı ayakkabı ile çıkmayın. [Ayakkabı kuralınızı yazın.]
- Yat içinde sigara ve açık ateş konusunda ekibin yönlendirmesine uyun.
- [Evcil hayvan, alkol, ses düzeni gibi kendi kurallarınızı ekleyin.]`,
  },
  {
    kind: "page", slug: "hakkimizda", sort: 0,
    title: "Hakkımızda",
    excerpt: "yatpaketi kimdir, nasıl çalışır.",
    content: `${note}

yatpaketi, Türkiye'de yat ve yat kiralama için hazırlanmış bir platformdur.

## Biz kimiz?
[Firmanızın kısa hikâyesini yazın: kaç yıldır bu işte olduğunuz, hangi bölgelerde çalıştığınız, neyi önemsediğiniz.]

## Nasıl çalışıyoruz?
- Yatları tek tek inceleyip listeliyoruz. [Bu cümle doğruysa bırakın, değilse düzeltin.]
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
Yatın sayfasında "Kaptan dahil" bilgisi yer alır.

## Yemek ve içecek dahil mi?
Yata ve kiralama türüne göre değişir. [Kendi işleyişinizi yazın.] Ayrıntı için [Yatpaketi Rehberi](/rehber) sayfasına bakabilirsiniz.

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
