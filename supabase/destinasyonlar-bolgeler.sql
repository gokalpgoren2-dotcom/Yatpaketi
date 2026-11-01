-- Yatpaketi Rehberi > Destinasyonlar: 6 bolge. Onceki 9 taslak destinasyon yazisi silinip yerine bu 6 eklenir.
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir (ikinci seferde yazilara dokunmaz).
-- DIKKAT: Onceki taslak yazilari panelden duzenlediyseniz o duzenlemeler silinir.
delete from public.blog_posts where kind = 'destination' and slug in (
  'gocek-12-ada','oludeniz-kelebekler-vadisi','kekova-batik-sehir','knidos-datca','gokova-korfezi',
  'bozburun-sombeki','kas-meis','bodrum-adalari','marmaris-hisaronu');

insert into public.blog_posts (slug,title_tr,excerpt_tr,content_tr,title_en,excerpt_en,content_en,kind,sort_order,status,published_at) values

('fethiye-korfezi-gocek','Fethiye Körfezi - Göcek','Korunaklı koylar, 12 Ada, Gemiler, Ölüdeniz ve Kelebekler Vadisi: mavi yolculuğun klasik bölgesi.',
$tr$
Fethiye Körfezi ve komşusu Göcek Körfezi, mavi yolculuğa ilk çıkanlar için en rahat bölgedir. Koylar birbirine yakın, sular sakin ve çoğu gün rüzgârdan korunaklıdır.

## Neler görülür?
- **Göcek'in 12 Adası:** Tersane Adası'ndaki Bizans kalıntıları, Yassıcalar ve Kızılada çevresindeki berrak ve sığ koylar.
- **Bedri Rahmi Koyu ve Sarsala:** Akşam demirleme için sevilen sakin koylar.
- **Gemiler Adası:** Bizans dönemine ait yapılarıyla yürüyerek gezilebilen bir ada.
- **Ölüdeniz ve Kelebekler Vadisi:** Falezlerle çevrili bir vadi, şelale ve küçük bir plaj. Vadiye karadan ulaşmak zordur, tekneyle gelmek en kolay yoldur.

## En iyi dönem
Mayıs sonundan Ekim ortasına kadar deniz sıcaktır. Temmuz ve Ağustos kalabalık, Haziran ve Eylül hem sakin hem sıcaktır.

## İpucu
Kelebekler Vadisi ve Ölüdeniz öğle saatlerinde kalabalık olur, sabah erken ya da öğleden sonra gitmek daha rahattır.

Göcek ve Fethiye çıkışlı tekneleri [Limanlar](/limanlar) sayfasında bulabilirsiniz.
$tr$,
'Fethiye Bay - Göcek','Sheltered coves, the 12 Islands, Gemiler, Ölüdeniz and Butterfly Valley: the classic blue voyage region.',
$en$
Fethiye Bay and its neighbour Göcek Bay make up the easiest region for a first blue voyage. The coves are close together, the water is calm and most days it is sheltered from the wind.

## What to see
- **The 12 Islands of Göcek:** Byzantine ruins on Tersane Island, and clear, shallow coves around Yassıcalar and Kızılada.
- **Bedri Rahmi Cove and Sarsala:** Calm coves, loved for overnight anchoring.
- **Gemiler Island:** An island with Byzantine-era buildings, easy to explore on foot.
- **Ölüdeniz and Butterfly Valley:** A cliff-lined valley with a waterfall and a small beach. It is hard to reach by land, and arriving by boat is the easiest way.

## Best time
From late May to mid-October the sea is warm. July and August are busy; June and September are both calmer and warm.

## Tip
Butterfly Valley and Ölüdeniz are crowded around midday, so go early in the morning or in the afternoon.

Find boats departing from Göcek and Fethiye on the [Ports](/en/limanlar) page.
$en$,'destination',1,'published',now()),

('bodrum-gokova-korfezi','Bodrum - Gökova Körfezi','Canlı Bodrum ve çevresindeki koylar, ardından Gökova\'nın sakin ve yemyeşil körfezi.',
$tr$
Bodrum'un canlılığı ile Gökova Körfezi'nin sakinliği tek rotada buluşur. Bodrum gece hayatı, kalesi ve marinasıyla bilinir; Gökova ise yeşil dağların arasında, adalarla dolu uzun bir körfezdir.

## Neler görülür?
- **Bodrum Kalesi:** Marinanın yanındaki tarihi kale, denizden çok güzel görünür.
- **Karaada ve Orak Adası:** Karaada'nın sıcak sulu mağarası ve çamur banyosuyla, Orak Adası'nın berrak suyuyla bilinir.
- **Yalıkavak ve Gümüşlük:** Gün batımı ve balık yemeği için sevilen yerler.
- **Cennet Adası:** Çam ağaçlarıyla kaplı sakin bir ada ve sığ koylar.
- **Sedir Adası:** Beyaz kumuyla ve antik kalıntılarıyla bilinir. Giriş için güncel kurallar geçerlidir.
- **Akyaka:** Körfezin ucunda yeşil ve sakin bir yerleşim.

## En iyi dönem
Mayıs-Ekim. Temmuz ve Ağustos'ta Bodrum çok canlı ve kalabalık olur; sakinlik arayanlar için Haziran ve Eylül daha uygundur. Gökova'nın içi çoğu zaman sakindir, bahar ve sonbaharda da keyiflidir.

## İpucu
Gökova'da ışık kirliliği az olduğu için akşam gökyüzü çok net görünür. Bodrum'dan Yunan adalarına da rotalar çıkar, bunun için önceden bilgi vermeniz gerekir.

Bodrum çıkışlı tekneleri [Limanlar](/limanlar/bodrum) sayfasında bulabilirsiniz.
$tr$,
'Bodrum - Gökova Bay','Lively Bodrum and its coves, followed by the calm, green bay of Gökova.',
$en$
The energy of Bodrum and the calm of Gökova Bay come together on one route. Bodrum is known for its nightlife, castle and marina; Gökova is a long bay of islands set among green mountains.

## What to see
- **Bodrum Castle:** The historic castle next to the marina, beautiful from the sea.
- **Karaada and Orak Island:** Karaada is known for its hot-spring cave and mud baths, Orak Island for its clear water.
- **Yalıkavak and Gümüşlük:** Popular for sunsets and fish dinners.
- **Cennet (Paradise) Island:** A calm island covered in pine trees, with shallow coves.
- **Sedir Island:** Known for its white sand and ancient ruins. Current entry rules apply.
- **Akyaka:** A green, peaceful settlement at the head of the bay.

## Best time
May to October. Bodrum is very lively and crowded in July and August; June and September suit those who want calm. The inner bay of Gökova is often calm, so spring and autumn can be lovely too.

## Tip
Light pollution is low in Gökova, so the night sky is very clear. Routes also run from Bodrum to the Greek islands; please tell us beforehand if you want to cross abroad.

Find boats departing from Bodrum on the [Ports](/en/limanlar/bodrum) page.
$en$,'destination',2,'published',now()),

('datca-hisaronu-korfezi','Datça - Hisarönü Körfezi','Ege ile Akdeniz\'in buluştuğu ince yarımada: Knidos, Datça ve Hisarönü\'nün sakin koyları.',
$tr$
Datça Yarımadası, kuzeyinde Gökova, güneyinde Hisarönü olmak üzere iki körfezi ayıran uzun ve ince bir kara parçasıdır. Ucundaki Knidos, mavi yolculuğun en özel duraklarından biridir.

## Neler görülür?
- **Knidos:** İki limanı olan bir antik kent. Tiyatro, tapınak kalıntıları ve limanın kıyısındaki yapıları gezilebilir. Gün batımında yürümek özellikle keyiflidir.
- **Datça merkezi:** Küçük ve sakin bir liman kasabası. Badem ve zeytin ürünleriyle bilinir.
- **Hayıtbükü ve çevresi:** Yüzmek için sakin, temiz koylar.
- **Hisarönü Körfezi ve Orhaniye:** Sığ sulu uzun bir kumsalı ve sakin koylarıyla yüzmek için çok uygundur.

## En iyi dönem
Mayıs-Haziran ve Eylül-Ekim ayları rüzgâr ve kalabalık açısından daha rahattır. Yarımadanın ucunda rüzgâr güçlenebildiği için seyir planı hava durumuna göre yapılır.

## İpucu
Knidos'ta akşam demirlemek istiyorsanız, hava koşullarına göre kaptanınızla önceden konuşun.

Datça çıkışlı tekneleri [Limanlar](/limanlar/datca) sayfasında bulabilirsiniz.
$tr$,
'Datça - Hisarönü Bay','A thin peninsula where the Aegean meets the Mediterranean: Knidos, Datça and the quiet coves of Hisarönü.',
$en$
The Datça Peninsula is a long, narrow strip of land separating two bays: Gökova to the north and Hisarönü to the south. Knidos, at its tip, is one of the most special stops on a blue voyage.

## What to see
- **Knidos:** An ancient city with two harbours. You can visit the theatre, temple remains and the buildings by the harbour. A walk at sunset is especially pleasant.
- **Datça town:** A small, quiet harbour town known for its almonds and olive products.
- **Hayıtbükü and surroundings:** Calm, clean coves for swimming.
- **Hisarönü Bay and Orhaniye:** A long shallow beach and calm coves, very good for swimming.

## Best time
May-June and September-October are easier in terms of wind and crowds. The wind can pick up at the tip of the peninsula, so the sailing plan follows the weather.

## Tip
If you want to anchor at Knidos for the evening, talk to your captain beforehand, as it depends on conditions.

Find boats departing from Datça on the [Ports](/en/limanlar/datca) page.
$en$,'destination',3,'published',now()),

('bozburun-sogut','Bozburun - Söğüt','Geleneksel gulet yapımının sürdüğü sakin yarımada, Sömbeki, Selimiye ve Söğüt.',
$tr$
Bozburun Yarımadası, Marmaris ile Datça arasında, Hisarönü Körfezi'nin kenarında uzanır. Bozburun kasabası el yapımı ahşap gulet üretimiyle bilinir ve limanında bu geleneksel teknelerin yapılışını görmek mümkündür. Yaz ortasında bile Marmaris ve Bodrum'a göre daha sakindir.

## Neler görülür?
- **Bozburun kasabası:** Küçük marina, balık lokantaları ve gulet tersaneleri.
- **Sömbeki Koyu:** Yarımadanın güneyinde sakin ve çok berrak bir koy.
- **Selimiye:** Eski bir liman köyü; akşam yemeği için güzel bir durak.
- **Söğüt:** Yarımadada sakin, küçük bir yerleşim ve koy; kalabalıktan uzak bir mola için uygundur.

## En iyi dönem
Mayıs-Ekim. Sakin koylar sayesinde bahar ve sonbaharda da rahat bir rotadır.

## İpucu
Gulet yapımına ilgi duyuyorsanız, kasabada bir tersanede çalışma sürecini görmek için kaptanınızla gün içinde durak planlayabilirsiniz.

Bozburun ve Selimiye çıkışlı tekneleri [Limanlar](/limanlar) sayfasında bulabilirsiniz.
$tr$,
'Bozburun - Söğüt','A quiet peninsula where traditional gulet building continues: Sömbeki, Selimiye and Söğüt.',
$en$
The Bozburun Peninsula lies between Marmaris and Datça, on the edge of Hisarönü Bay. The town of Bozburun is known for handmade wooden gulets, and you can see these traditional boats being built in its harbour. Even in midsummer it is quieter than Marmaris and Bodrum.

## What to see
- **Bozburun town:** A small marina, fish restaurants and gulet yards.
- **Sömbeki Cove:** A calm, very clear cove in the south of the peninsula.
- **Selimiye:** An old harbour village and a lovely stop for dinner.
- **Söğüt:** A small, quiet settlement and cove on the peninsula, good for a break away from the crowds.

## Best time
May to October. Thanks to its calm coves, it is also a comfortable route in spring and autumn.

## Tip
If you're interested in gulet building, ask your captain to plan a stop during the day to see work in a yard.

Find boats departing from Bozburun and Selimiye on the [Ports](/en/limanlar) page.
$en$,'destination',4,'published',now()),

('marmaris-ekincik','Marmaris - Ekincik','Marmaris\'in korunaklı limanı, İçmeler, Turunç ve Dalyan yakınındaki Ekincik Koyu.',
$tr$
Marmaris, geniş ve korunaklı limanıyla mavi yolculuk için en pratik başlangıç noktalarından biridir. Doğuya doğru ilerleyince Dalyan'ın yakınındaki Ekincik Koyu'na ulaşılır.

## Neler görülür?
- **Marmaris:** Geniş iç liman, kale ve çarşı. Kumanya ve akşam yemeği için pratik bir liman.
- **İçmeler ve Turunç:** Marmaris'e yakın, canlı kıyı yerleşimleri ve sakin koylar.
- **Ekincik Koyu:** Sakin ve çevresi yeşil, korunaklı bir koy. Dalyan'a buradan tekneyle gidilebilir; Dalyan'da kral mezarları ve nehir gezisi ile bilinen bir bölgedir.

## En iyi dönem
Mayıs-Ekim. Marmaris'in iç limanı çok korunaklı olduğu için bahar ve sonbaharda da rotalar rahat yapılır.

## İpucu
Dalyan gezisi gibi kara programları için kaptanınızla önceden konuşun; süre ve ulaşım tekneye ve hava koşuluna göre değişir.

Marmaris çıkışlı tekneleri [Limanlar](/limanlar/marmaris) sayfasında bulabilirsiniz.
$tr$,
'Marmaris - Ekincik','Marmaris\'s sheltered harbour, İçmeler, Turunç and Ekincik Cove near Dalyan.',
$en$
With its wide, sheltered harbour, Marmaris is one of the most practical starting points for a blue voyage. Heading east, you reach Ekincik Cove near Dalyan.

## What to see
- **Marmaris:** A wide inner harbour, a castle and a bazaar. A practical port for provisions and dinner ashore.
- **İçmeler and Turunç:** Lively coastal settlements near Marmaris, with calm coves.
- **Ekincik Cove:** A calm, green and sheltered cove. From here you can travel to Dalyan by boat; Dalyan is known for its rock tombs and river trips.

## Best time
May to October. Marmaris' inner harbour is very sheltered, so routes also run comfortably in spring and autumn.

## Tip
For land programmes such as a Dalyan trip, talk to your captain beforehand; duration and transport vary by boat and weather.

Find boats departing from Marmaris on the [Ports](/en/limanlar/marmaris) page.
$en$,'destination',5,'published',now()),

('kas-kekova','Kaş - Kekova','Batık şehir, Kaleköy, Üçağız, berrak sular ve Meis Adası\'na kısa bir geçiş.',
$tr$
Kaş, dağlarla denizin iç içe geçtiği küçük ve canlı bir limandır. Hemen doğusundaki Kekova ise korunaklı suları ve antik kalıntılarıyla mavi yolculuğun en sakin duraklarından biridir.

## Neler görülür?
- **Batık şehir (Simena):** Eski bir depremde kısmen suya gömülen antik yapılar. Koruma altındadır, üzerlerinde yüzmek ve dalmak yasaktır; tekneyle yavaşça üzerinden geçilir ve kalıntılar suyun içinden seçilir.
- **Kaleköy:** Tepedeki kalesiyle bölgenin en bilinen köyü. Yürüyerek kaleye çıkılabilir, aşağıda küçük lokantalar vardır.
- **Üçağız:** Sakin, küçük bir balıkçı köyü; akşam yemeği ve kısa bir yürüyüş için güzel.
- **Kaş çarşısı ve limanı:** Dar sokaklar, küçük dükkânlar ve deniz kenarındaki kafeler.
- **Meis Adası:** Renkli evleri ve küçük limanıyla Yunan adası. Adaya geçişte pasaport gerekir ve günübirlik geçişlerin kuralları dönemine göre değişir; kaptanla önceden konuşmanız gerekir.

## En iyi dönem
Mayıs-Ekim. Güneş batarken Kaleköy'ün ışığı özellikle güzeldir. Haziran ve sonrasında deniz yüzmek için oldukça sıcaktır.

## İpucu
Koruma alanı kuralları sık güncellenir. Kaptanınız bölgenin güncel kurallarını bilir, yüzme ve demirleme için onun yönlendirmesine uyun.

Kaş - Kekova çıkışlı tekneleri [Limanlar](/limanlar/kas-kekova) sayfasında bulabilirsiniz.
$tr$,
'Kaş - Kekova','The sunken city, Kaleköy, Üçağız, crystal-clear water and a short hop to Meis Island.',
$en$
Kaş is a small, lively harbour town where mountains and sea meet. Kekova, just to its east, is one of the quietest stops on a blue voyage, with its sheltered water and ancient remains.

## What to see
- **The sunken city (Simena):** Ancient structures partly submerged by an old earthquake. The site is protected, and swimming or diving over it is forbidden; boats pass slowly above and the ruins can be seen through the water.
- **Kaleköy:** The best-known village in the area, with a castle on the hill. You can walk up to the castle, and there are small restaurants below.
- **Üçağız:** A quiet little fishing village, lovely for dinner and a short walk.
- **Kaş old town and harbour:** Narrow streets, small shops and cafés by the sea.
- **Meis Island:** A Greek island with colourful houses and a small harbour. A passport is required to cross, and the rules for day trips change by season, so talk to your captain beforehand.

## Best time
May to October. The light on Kaleköy at sunset is especially beautiful. From June onwards the sea is warm enough for comfortable swimming.

## Tip
Protected-area rules change often. Your captain knows the current rules for the area, so follow his or her guidance on swimming and anchoring.

Find boats departing from Kaş - Kekova on the [Ports](/en/limanlar/kas-kekova) page.
$en$,'destination',6,'published',now())
on conflict (slug) do nothing;
