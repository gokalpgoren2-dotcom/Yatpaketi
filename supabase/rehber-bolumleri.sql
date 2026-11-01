-- Yatpaketi Rehberi: yeni bolum turleri + taslak icerik
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir.
do $$
declare c record;
begin
  for c in select conname from pg_constraint
    where conrelid='public.blog_posts'::regclass and contype='c' and pg_get_constraintdef(oid) ilike '%kind%'
  loop
    execute format('alter table public.blog_posts drop constraint %I', c.conname);
  end loop;
  alter table public.blog_posts add constraint blog_posts_kind_check
    check (kind in ('blog','guide','page','destination','route','package','process'));
end $$;

insert into public.blog_posts (slug,title_tr,excerpt_tr,content_tr,kind,sort_order,status,published_at) values
('gocek-12-ada','Göcek ve 12 Ada','Korunaklı koyları ve birbirine yakın adalarıyla mavi yolculuğun en rahat başlangıç noktası.','Göcek Körfezi, sakin suları ve birbirine kısa mesafedeki koylarıyla mavi yolculuğun en çok tercih edilen bölgelerinden biridir. "12 Ada" olarak anılan adalar grubu, çoğu gün rüzgârdan korunaklı demirleme imkânı verir.

## Neler görülür?
- **Tersane Adası:** Bizans dönemine ait kalıntılarıyla yürüyüş ve yüzme için güzel bir durak.
- **Yassıcalar ve Kızılada çevresi:** Berrak, sığ ve turkuaz koylar; yüzmek ve şnorkel için çok uygun.
- **Bedri Rahmi Koyu ve Sarsala:** Akşam demirleme için sevilen, sakin koylar.
- **Göcek Marina:** Kumanya tamamlamak ve akşam yemeği için pratik bir liman.

## En iyi dönem
Mayıs sonundan Ekim ortasına kadar deniz sıcaktır. Temmuz ve Ağustos kalabalık, Haziran ve Eylül hem sakin hem sıcaktır.

## İpucu
Koylar kısa mesafede olduğu için gün içinde sık sık demirlemeniz gerekmez. Yüzmeye, güneşlenmeye ve tekne keyfine daha çok zaman kalır.

Göcek çıkışlı tekneleri [Limanlar](/limanlar/gocek) sayfasında bulabilirsiniz.','destination',1,'published',now()),
('oludeniz-kelebekler-vadisi','Ölüdeniz ve Kelebekler Vadisi','Falezlerle çevrili vadi, şelale ve Gemiler Adası: Fethiye çıkışlı rotaların en bilinen durakları.','Fethiye Körfezi''nin güneyinde, Ölüdeniz''in hemen ilerisinde yer alan Kelebekler Vadisi''ne karadan ulaşmak zordur. Tekneyle gelmek hem en kolay hem de en güzel yoldur.

## Neler görülür?
- **Kelebekler Vadisi:** Dik kayalıklar arasında küçük bir plaj ve vadinin içinde bir şelale. Vadiye yürüyüş yapmak isteyenler için kısa bir patika vardır.
- **Ölüdeniz Lagünü:** Sakin, dar bir lagün. Çoğu zaman gün içinde kalabalık olur, tekneyle sabah erken ya da öğleden sonra gitmek daha rahattır.
- **Gemiler Adası:** Bizans döneminden kalma yapılarıyla, yürüyerek gezilebilen ve fotoğrafı güzel bir ada.

## En iyi dönem
Nisan sonundan Ekim sonuna kadar. Yaz öğle saatlerinde kalabalığı azaltmak için sabah erken saatleri tercih edin.

## İpucu
Vadiye yaklaşırken deniz dalgalı olabilir. Kaptanınız rüzgâra göre en rahat demirleme noktasını seçecektir.','destination',2,'published',now()),
('kekova-batik-sehir','Kekova ve Batık Şehir','Antik kalıntıların suyun altında kaldığı, kıyı boyunca sakin köylerin yer aldığı eşsiz bir rota.','Kekova, Kaş ile Demre arasında, uzun bir adanın korunaklı kıyıları arasında yer alan bir bölgedir. Dalgasız suları ve antik kalıntılarıyla mavi yolculuğun en sakin duraklarından biridir.

## Neler görülür?
- **Batık şehir (Simena):** Eski bir depremde kısmen suya gömülen antik yapılar. Koruma altındadır, üzerlerinde yüzmek ve dalmak yasaktır; tekneyle yavaşça üzerinden geçilir ve kalıntılar suyun içinden seçilir.
- **Kaleköy:** Tepedeki kalesiyle bölgenin en bilinen köyü. Yürüyerek kaleye çıkılabilir, aşağıda küçük lokantalar vardır.
- **Üçağız:** Sakin, küçük bir balıkçı köyü; akşam yemeği ve kısa bir yürüyüş için güzel.

## En iyi dönem
Mayıs ile Ekim arası. Güneş batarken Kaleköy''ün ışığı özellikle güzeldir.

## İpucu
Koruma alanı kuralları sık güncellenir. Kaptanınız bölgenin güncel kurallarını bilir, yüzme ve demirleme için onun yönlendirmesine uyun.','destination',3,'published',now()),
('knidos-datca','Knidos ve Datça Yarımadası','Ege ile Akdeniz''in buluştuğu ince yarımada: antik liman, sakin koylar ve temiz deniz.','Datça Yarımadası, kuzeyinde Gökova, güneyinde Hisarönü olmak üzere iki körfezi ayıran uzun ve ince bir kara parçasıdır. Ucundaki Knidos, mavi yolculuğun en özel duraklarından biridir.

## Neler görülür?
- **Knidos:** İki limanı olan bir antik kent. Tiyatro, tapınak kalıntıları ve limanın kıyısındaki yapıları gezilebilir. Gün batımında yürümek özellikle keyiflidir.
- **Datça merkezi:** Küçük ve sakin bir liman kasabası. Badem ve zeytin ürünleriyle bilinir.
- **Hayıtbükü ve çevresi:** Yüzmek için sakin, temiz koylar.

## En iyi dönem
Mayıs-Haziran ve Eylül-Ekim ayları rüzgâr ve kalabalık açısından daha rahattır. Yarımadanın ucunda rüzgâr güçlenebildiği için seyir planı hava durumuna göre yapılır.

## İpucu
Knidos''ta akşam demirlemek istiyorsanız, hava koşullarına göre kaptanınızla önceden konuşun.

Datça çıkışlı tekneleri [Limanlar](/limanlar/datca) sayfasında bulabilirsiniz.','destination',4,'published',now()),
('gokova-korfezi','Gökova Körfezi','Uzun, derin ve sakin bir körfez: Cennet Adası, Sedir Adası ve doğayla iç içe koylar.','Gökova, Bodrum ile Datça arasında uzanan geniş bir körfezdir. Kuzeyindeki yeşil dağlar ve içinde dağılmış küçük adalarıyla, sessiz bir mavi yolculuk isteyenler için idealdir.

## Neler görülür?
- **Cennet Adası:** Çam ağaçlarıyla kaplı, sakin bir ada ve sığ koylar.
- **Sedir Adası (Kleopatra Adası):** Kumunun beyazlığıyla bilinen, antik kalıntılara da ev sahipliği yapan ada. Giriş için güncel kurallar geçerlidir.
- **Akyaka ve Karacasöğüt:** Körfezin ucundaki yeşil, sakin yerleşimler.

## En iyi dönem
Mayıs-Ekim. Körfezin içi genellikle sakin olduğu için bahar ve sonbahar da keyifli geçer.

## İpucu
Akşam gökyüzü körfezin sessizliğinde çok net görünür; ışık kirliliği az olduğu için yıldızları izlemek için güzel bir bölgedir.','destination',5,'published',now()),
('bozburun-sombeki','Bozburun ve Sömbeki','Geleneksel gulet yapımının sürdüğü sakin yarımada ve temiz koylar.','Bozburun Yarımadası, Marmaris ile Datça arasında, Hisarönü Körfezi''nin kenarında uzanır. Bozburun kasabası, el yapımı ahşap gulet üretimiyle bilinir ve limanında bu geleneksel teknelerin yapılışını görmek mümkündür.

## Neler görülür?
- **Bozburun kasabası:** Küçük marina, balık lokantaları ve gulet tersaneleri.
- **Sömbeki Koyu:** Yarımadanın güneyinde, sakin ve çok berrak bir koy.
- **Selimiye:** Eski bir liman köyü; akşam yemeği için güzel bir durak.

## En iyi dönem
Mayıs-Ekim. Bölge yaz ortasında bile Marmaris ve Bodrum''a göre daha sakindir.

## İpucu
Gulet yapımına ilgi duyuyorsanız, kasabada bir tersanede çalışma sürecini görmek için kaptanınızla gün içinde durak planlayabilirsiniz.

Bozburun çıkışlı tekneleri [Limanlar](/limanlar/bozburun) sayfasında bulabilirsiniz.','destination',6,'published',now()),
('kas-meis','Kaş ve Meis Adası','Berrak su, dalış noktaları ve Yunan adası Meis''e kısa bir geçiş.','Kaş, Antalya''nın batısında, dağlarla denizin iç içe geçtiği küçük ve canlı bir limandır. Hemen karşısındaki Meis (Kastellorizo) adasıyla bilinir.

## Neler görülür?
- **Kaş çarşısı ve limanı:** Dar sokaklar, küçük dükkânlar ve deniz kenarındaki kafeler.
- **Meis Adası:** Renkli evleri ve küçük limanıyla Yunan adası. Adaya geçişte pasaport gerekir ve günübirlik geçişlerin kuralları dönemine göre değişir; tekne kaptanıyla önceden konuşmanız gerekir.
- **Dalış noktaları:** Berrak su ve sualtı mağaraları dalış meraklılarının uğrak noktasıdır.

## En iyi dönem
Mayıs-Ekim. Deniz Haziran ve sonrasında yüzmek için oldukça sıcaktır.

## İpucu
Meis gibi yurt dışı geçişleri için tarihler ve belgeler önceden netleştirilmelidir. Bu konuda talep sırasında bize bilgi verin.','destination',7,'published',now()),
('bodrum-adalari','Bodrum ve Çevresindeki Koylar','Gece hayatı, antik şehir ve Ege''nin tazeliğiyle canlı bir başlangıç.','Bodrum, gece hayatı, kalesi ve marinasıyla Ege kıyısının en canlı noktalarından biridir. Tekneyle çıkınca çevresindeki sakin koyları ve adaları keşfetmek mümkün olur.

## Neler görülür?
- **Bodrum Kalesi:** Marinanın yanında, denizden çok güzel görünen tarihi kale.
- **Karaada:** Volkanik kökenli, sıcak sulu mağarası ve çamur banyolarıyla bilinen küçük ada.
- **Orak Adası:** Kumsalı ve berrak suyuyla yüzme molası için sevilen ada.
- **Yalıkavak ve Gümüşlük:** Yarımadanın batısında, gün batımı ve balık yemeği için sevilen yerler.

## En iyi dönem
Mayıs-Ekim. Temmuz ve Ağustos''ta Bodrum çok canlı ve kalabalık olur; sakinlik arayanlar için haziran ve eylül daha uygundur.

## İpucu
Bodrum''dan Datça, Gökova ve Yunan adalarına rotalar çıkar. Yurt dışı geçişi için önceden bilgi vermeniz gerekir.

Bodrum çıkışlı tekneleri [Limanlar](/limanlar/bodrum) sayfasında bulabilirsiniz.','destination',8,'published',now()),
('marmaris-hisaronu','Marmaris ve Hisarönü Körfezi','Orhaniye, Turunç ve Selimiye: Marmaris çevresinin sakin koyları.','Marmaris, geniş ve korunaklı limanıyla mavi yolculuk için en pratik başlangıç noktalarından biridir. Çevresindeki Hisarönü Körfezi, kısa mesafede birbirinden farklı birçok koy sunar.

## Neler görülür?
- **Orhaniye:** Sığ sulu, uzun bir kumsalın yer aldığı koy; yüzmek için çok uygun.
- **Turunç ve İçmeler:** Marmaris''e yakın, canlı kıyı yerleşimleri.
- **Selimiye:** Eski liman köyü ve sakin akşam yemekleri.
- **Hisarönü ve Bozburun yarımadası:** Daha sessiz, kalabalıktan uzak koylar.

## En iyi dönem
Mayıs-Ekim. Marmaris''in iç limanı çok korunaklıdır, bu yüzden bahar ve sonbaharda da rotalar rahat yapılır.

## İpucu
Marmaris''ten Datça''ya, Bozburun''a ve Rodos yönüne rotalar çıkar. Yurt dışı geçişi için önceden bilgi vermeniz gerekir.

Marmaris çıkışlı tekneleri [Limanlar](/limanlar/marmaris) sayfasında bulabilirsiniz.','destination',9,'published',now()),
('gocek-fethiye-12-ada-rotasi','Göcek – Fethiye 12 Ada Rotası (7 gece)','Mavi yolculuğun klasiği: korunaklı koylar, Tersane Adası, Gemiler ve Kelebekler Vadisi.','Mavi yolculuğa ilk kez çıkanlar için en rahat ve en çok tercih edilen rota. Mesafeler kısa, koylar korunaklı, her gün yüzmeye zaman kalır. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **1. gün:** Göcek''te karşılama ve yerleşme. Akşam yakın bir koyda ilk demirleme ve akşam yemeği.
- **2. gün:** Tersane Adası ve çevresindeki koylar. Yürüyüş, yüzme ve şnorkel.
- **3. gün:** Yassıcalar ve Kızılada çevresi. Turkuaz sığ koylarda tam gün keyif.
- **4. gün:** Bedri Rahmi Koyu ve Sarsala. Sakin bir akşam.
- **5. gün:** Fethiye Körfezi''ne geçiş. Gemiler Adası''nda yürüyüş.
- **6. gün:** Ölüdeniz ve Kelebekler Vadisi. Şelale ve plaj.
- **7. gün:** Fethiye''ye dönüş ve son akşam.
- **Son sabah:** Kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları, ilk kez tekne kiralayanlar. Seyir mesafeleri kısa olduğu için deniz tutması yaşayanlar için de rahat bir rotadır.

## Süre ve mesafe
Günlük seyir süresi genellikle birkaç saati geçmez. Çoğu gün yarım gün seyir, yarım gün koyda dinlenme şeklinde geçer.','route',1,'published',now()),
('bodrum-datca-gokova-rotasi','Bodrum – Datça – Gökova Rotası (7 gece)','Ege''nin canlı limanından Knidos''a, oradan Gökova''nın sakin koylarına uzanan rota.','Bodrum''dan çıkıp Datça Yarımadası''nın ucundaki Knidos''a, oradan Gökova Körfezi''ne dönen bu rota; canlı ve sakin yerlerin dengesini sevenler için uygundur. Program örnektir, hava durumuna göre değişebilir.

## Gün gün
- **1. gün:** Bodrum''da karşılama, kumanya ve ilk akşam.
- **2. gün:** Bodrum çevresi: Karaada ve Orak Adası.
- **3. gün:** Datça yönüne seyir; akşam sakin bir koy.
- **4. gün:** Knidos: antik liman ve gün batımı yürüyüşü.
- **5. gün:** Datça''ya uğrayıp Gökova''ya geçiş.
- **6. gün:** Cennet Adası ve Sedir Adası çevresi.
- **7. gün:** Bodrum''a dönüş.

## Kimlere uygun?
Daha uzun seyir günlerini sorun etmeyen, farklı manzaraları bir arada görmek isteyen gruplar. Datça ucunda rüzgâr artabileceği için hava penceresi iyi seçilmelidir.

## İpucu
Rüzgâr nedeniyle sıralama değişebilir. Esnek bir program, en güzel koylarda daha uzun kalmanızı sağlar.','route',2,'published',now()),
('marmaris-datca-bozburun-rotasi','Marmaris – Datça – Bozburun Rotası (7 gece)','Hisarönü Körfezi''nin sakin koyları, Bozburun yarımadası ve Datça''nın ucu.','Marmaris çıkışlı klasik rotalardan biri. Kalabalıktan uzak, dingin koyları; geleneksel gulet yapımıyla bilinen Bozburun''u ve Datça Yarımadası''nı birleştirir.

## Gün gün
- **1. gün:** Marmaris''te karşılama, kumanya ve yakın bir koyda ilk akşam.
- **2. gün:** Orhaniye ve Hisarönü Körfezi koyları.
- **3. gün:** Selimiye ve Bozburun yarımadası.
- **4. gün:** Sömbeki Koyu ve çevresi: berrak su, sessizlik.
- **5. gün:** Datça yönüne seyir; Datça''da akşam yemeği.
- **6. gün:** Knidos''a kısa bir uğrama ve dönüş yönü.
- **7. gün:** Marmaris''e dönüş.

## Kimlere uygun?
Sessiz, doğal koyları sevenler ve ikinci kez tekne kiralayanlar. Seyir günleri uzun olabileceği için gün planı önceden konuşulmalıdır.','route',3,'published',now()),
('fethiye-kas-kekova-rotasi','Fethiye – Kaş – Kekova Rotası (7 gece)','Fethiye''den Kekova''ya uzanan doğu rotası: Patara, Kalkan, Kaş ve batık şehir.','Fethiye''den doğuya doğru ilerleyen bu rota, daha uzun seyir mesafeleri ve daha az kalabalık duraklarla karakterlidir. Kekova ve batık şehir rotanın en özel anıdır. Program örnektir; aşağıdaki sıra hava ve rüzgâra göre değişebilir.

## Gün gün
- **1. gün:** Fethiye''de karşılama ve yerleşme.
- **2. gün:** Ölüdeniz ve Kelebekler Vadisi.
- **3. gün:** Doğuya seyir; sakin koylar ve açık deniz yüzme molaları.
- **4. gün:** Kalkan ve Kaş çevresi.
- **5. gün:** Meis''e bakış ve dalış molaları (Meis geçişi için belgeler önceden netleştirilir).
- **6. gün:** Kekova: batık şehir, Kaleköy ve Üçağız.
- **7. gün:** Kaş ya da Kekova''da son akşam; transfer ve teslim.

## Kimlere uygun?
Seyri seven, kalabalıktan uzak ve farklı bir rota arayan gruplar. Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) bir rota olarak planlanır; bu durum tekneye göre ek masraf getirebilir.','route',4,'published',now()),
('hafta-sonu-kacamagi','Hafta Sonu Kaçamağı','2-3 gecelik kısa mavi yolculuk: şehirden çıkıp denizde dinlenmek isteyenler için.','Tatile yeni çıkanlar ya da kısa bir mola isteyenler için 2-3 gecelik pakettir. Kalabalık gruplarla gelmek zorunda değilsiniz; küçük bir grupla da keyifli geçer.

## Pakete neler dahil olabilir?
- Tekne ve mürettebat (kaptan, gerekirse aşçı ve tayfa)
- Yakıt hariç ya da dahil seçenekleri tekneye göre değişir
- Yakın koylarda demirleme ve yüzme molaları
- Kahvaltı ve öğle yemeği seçeneği

## Kimlere uygun?
Hafta sonu ya da uzatılmış bir tatil, kısa romantik kaçamak, küçük arkadaş grubu.

Fiyat; tekneye, sezona ve rotaya göre değişir. Güncel bilgi ve teklif için talep formunu doldurun.','package',1,'published',now()),
('klasik-mavi-yolculuk','Klasik Mavi Yolculuk (7 gece)','Bir haftalık, her şeyin planlandığı tam mavi yolculuk: tekne, rota ve konfor.','En çok tercih edilen paket. Bir hafta boyunca günde birkaç saat seyir, bolca yüzme ve akşamları farklı koylarda demirleme ile geçer.

## Pakete neler dahil olabilir?
- Tekne ve mürettebat (kaptan, aşçı, tayfa)
- Klasik rotalardan birinin planlanması (Göcek, Bodrum ya da Marmaris çıkışlı)
- Kahvaltı, öğle yemeği ve akşam yemeği seçenekleri
- Su sporları ekipmanı (tekneye göre)

## Kimlere uygun?
Aileler, arkadaş grupları, ilk kez mavi yolculuğa çıkanlar ve tüm tatilini denizde geçirmek isteyenler.

Fiyat; tekneye, sezona ve rotaya göre değişir. Güncel teklif için talep formunu doldurun. Rota seçiminde yardıma ihtiyacınız olursa [Klasik Rotalar](/rotalar) sayfasına göz atın.','package',2,'published',now()),
('romantik-kacamak','Romantik Kaçamak','Çiftler için küçük, sessiz ve özel bir mavi yolculuk.','Küçük bir tekne, sakin koylar ve gün batımında baş başa akşam yemekleri. Çiftler, balayı ya da yıldönümü için hazırlanan pakettir.

## Neler planlanabilir?
- Sakin ve az kalabalık koylar
- Özel akşam yemeği ve gün batımı demirleme
- Tekne üzerinde süsleme, pasta, çiçek gibi özel istekler
- Kaptanla önceden konuşulan gizli sürprizler

## Kimlere uygun?
Çiftler, balayı, evlilik yıldönümü, evlilik teklifi planlayanlar.

Özel istekleriniz talep sırasında yazılır. Fiyat tekneye ve sezona göre değişir; güncel teklif için talep formunu doldurun.','package',3,'published',now()),
('aile-ve-arkadas-tatili','Aile ve Arkadaş Tatili','Kabin sayısına göre kalabalık gruplar için rahat, ortak bir mavi yolculuk.','Aileler ve arkadaş grupları için, kabin sayısı ve konfor gözetilerek hazırlanan pakettir. Çocuklu aileler için güvenli, sığ ve sakin koylar tercih edilir.

## Neler planlanabilir?
- Grup büyüklüğüne uygun kabin düzeni
- Çocuklar için sığ koylar, can yeleği ve tekne üstü aktiviteler
- Yemek tercihleri, vejetaryen ya da alerji gibi özel durumlar
- Su oyuncakları ve ortak eğlence ekipmanı

## Kimlere uygun?
Çocuklu aileler, geniş aile buluşmaları, arkadaş grupları.

Yemek tercihleri, alerjiler ve çocukların yaşları talep sırasında belirtilmelidir. Fiyat tekneye ve sezona göre değişir; güncel teklif için talep formunu doldurun.','package',4,'published',now()),
('ozel-gun-paketi','Özel Gün ve Kurumsal Organizasyon','Doğum günü, kutlama ve ekip buluşmaları için özel hazırlanan tekne günleri.','Doğum günü, kutlama, ekip buluşması ya da küçük bir organizasyon için tekneyi birkaç saatliğine ya da gün boyu özel olarak kiralayabilirsiniz.

## Neler planlanabilir?
- Günübirlik koy turları ve kutlamalar
- Müzik, süsleme ve özel menü
- Grup büyüklüğüne uygun tekne seçimi
- Kurumsal ekipler için çalışma ve dinlenme dengesi

## Kimlere uygun?
Doğum günü, kutlama, küçük kurumsal gruplar.

Katılımcı sayısı, saat ve istekler talep sırasında belirtilmelidir. Fiyat tekneye ve gün sayısına göre değişir; güncel teklif için talep formunu doldurun.','package',5,'published',now()),
('talep','Talebinizi iletin','Tarih, kişi sayısı ve rota fikrinizle başlayın.','Sitedeki tekne sayfasından ya da genel talep formundan; hangi tarihte, kaç kişiyle ve hangi bölgede tekne aradığınızı bize iletin. Net bir rota fikriniz olmasa da sorun değil, birlikte netleştiririz.

Bu aşamada bir ödeme yapmanız gerekmez. Talep göndermek sizi bağlamaz.','process',1,'published',now()),
('musaitlik-teklif','Müsaitlik ve teklif','Size uygun tekneleri ve fiyatları kısa sürede netleştiririz.','Tekne ve mürettebatın o tarihte müsait olup olmadığını kontrol eder, size uygun seçenekleri ve fiyat bilgisini iletiriz. Fiyatlar; tekneye, sezona, rotaya ve sürenin uzunluğuna göre değişir.

Bu aşamada rota, kabin düzeni ve ek istekleriniz konuşulur.','process',2,'published',now()),
('onay-sozlesme','Onay ve sözleşme','Teklifi onaylayınca tekne sizin için ayrılır.','Teklifi uygun bulursanız rezervasyon onaylanır. Kiralama koşulları, ödeme planı ve iptal şartları sözleşmede açıkça yazılır. Sözleşmeyi okuyup onayladıktan sonra tekne tarihlerinizde başkasına verilmez.

Ödeme koşulları tekneye ve sezona göre değişebilir. Ayrıntılar sözleşmenizde yer alır.','process',3,'published',now()),
('detaylar-kumanya-listesi','Detayların netleşmesi ve kumanya listesi','Yolcu listesi, rota ve yemek tercihlerinizi paylaşırsınız.','Onaydan sonra, yolculuktan önce şunlar netleştirilir:

- **Yolcu bilgileri:** Kimlik bilgileri ve kişi sayısı
- **Varış zamanı:** Uçuş ya da ulaşım saatleriniz
- **Rota ve gün planı:** Hangi koylara gideceğiniz ve ne kadar kalacağınız
- **Yemek ve içecek tercihleri:** Sevdiğiniz ve sevmediğiniz yiyecekler, alerjiler, vejetaryen ya da vegan menüler, içecek istekleriniz

Bu bilgilerle bir kumanya listesi hazırlanır.','process',4,'published',now()),
('kumanya-alimi','Kumanya alımı','Yiyecek ve içecekler yolculuktan önce tekneye yüklenir.','Kumanya, yolculuğun en önemli hazırlıklarından biridir. Listeye göre yiyecek ve içecekler, yolculuk başlamadan önce marketten alınıp tekneye yüklenir.

Uygulama tekneye göre değişir:
- Çoğu teknede kaptan ya da aşçı, sizin listenize göre alışverişi yapar. Alışveriş masrafı ayrıca hesaplanır ve belgelerle size gösterilir.
- Dilerseniz kendi kumanyanızı da getirebilirsiniz.
- Yolculuk sırasında eksilen şeyler, uğranan liman ve köylerde tamamlanır.

Kumanyanın nasıl hesaplanacağı, tekne ve sözleşme koşullarına göre netleştirilir.','process',5,'published',now()),
('karsilama-welcome','Karşılama ve welcome','Limanda sizi kaptan ve mürettebat karşılar.','Yolculuk günü, tekne sizi liman ya da marinada bekler. Kaptan ve mürettebat sizi karşılar, bagajlarınızı yerleştirmenize yardım eder.

- **Welcome:** Karşılama içeceği ve küçük bir ikramla yolculuk başlar.
- **Kabinler:** Kabinleriniz gösterilir ve yerleşme yapılır.
- **Tekne tanıtımı:** Teknenin kullanımı, yaşam alanları ve kurallar anlatılır.
- **Güvenlik brifingi:** Can yelekleri, yangın söndürücü ve acil durum prosedürleri hakkında bilgi verilir.
- **Rota ve gün planı:** İlk günlerin planı, hava durumuyla birlikte konuşulur.

Bu görüşme, yolculuğun geri kalanını rahat geçirmeniz için önemlidir.','process',6,'published',now()),
('seyir-gunleri','Seyir günleri','Yüzme, güneşlenme, koylarda demirleme: günler böyle geçer.','Bir mavi yolculuk günü genellikle şöyle akar:

- **Sabah:** Kahvaltı ve sabah yüzmesi
- **Öğleye doğru:** Yeni bir koya seyir
- **Öğle:** Koyda demirleme, yüzme ve öğle yemeği
- **Öğleden sonra:** Gün içi dinlenme, su sporları, şnorkel ya da kısa yürüyüşler
- **Akşam:** Limanda ya da koyda demirleme, akşam yemeği

Hava ve rüzgâr rotayı etkileyebilir. Kaptan, güvenliğinizi öncelikli tutarak rotayı ve sıralamayı gerektiğinde değiştirir. Esnek bir plan, en güzel yerlerde daha uzun kalmanızı sağlar.','process',7,'published',now()),
('donus-teslim','Dönüş ve teslim','Son sabah kahvaltı, tekne kontrolü ve vedalaşma.','Yolculuğun son günü, tekne anlaşılan limana dönülür. Bagajlarınızı toplarsınız, teknenin genel durumu kaptanla birlikte kontrol edilir ve ek masraflar (yakıt, kumanya farkı vb.) varsa hesaplanır.

Teslim saatleri ve ek masraflar tekneye göre değişir; bunlar sözleşmede yazar. Depozito alınmışsa, koşullara göre iade edilir.','process',8,'published',now()),
('sonrasi','Yolculuktan sonra','Geri bildiriminiz bizim için çok değerli.','Dönüşte yolculuğunuz hakkında geri bildirim paylaşırsanız, hem bize hem de ileride tekne kiralayacak diğer misafirlere yardımcı olursunuz. Fotoğraflarınızı paylaşmak isterseniz bizimle iletişime geçebilirsiniz.

Bir sonraki yolculuk için rota ve tekne önerilerimizi de memnuniyetle paylaşırız.','process',9,'published',now())
on conflict (slug) do nothing;
