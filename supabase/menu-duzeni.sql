-- Menu duzeni: tekne tipleri, limanlar (Selimiye eklenir), S.S.S ve Yat ve Yatcilik Kulturu sayfalari
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir.

-- 1) Tekne tipleri: Gulet, Motoryat, Yelkenli / Katamaran, Luks Yat
update public.boats set category_id = (select id from public.categories where slug='yelkenli')
  where category_id = (select id from public.categories where slug='katamaran');
insert into public.categories (slug, name_tr, name_en, sort_order) values
  ('gulet','Gulet','Gulet',1), ('motoryat','Motoryat','Motor Yacht',2),
  ('yelkenli','Yelkenli / Katamaran','Sailing Yacht / Catamaran',3), ('luks-yat','Lüks Yat','Luxury Yacht',4)
on conflict (slug) do update set name_tr = excluded.name_tr, name_en = excluded.name_en, sort_order = excluded.sort_order, is_active = true;
delete from public.categories where slug not in ('gulet','motoryat','yelkenli','luks-yat');

-- 2) Limanlar: Selimiye eklenir ve sira: Gocek, Fethiye, Bodrum, Marmaris, Datca, Bozburun, Kas - Kekova, Selimiye
insert into public.destinations (slug, name_tr, name_en, blurb_tr, blurb_en, intro_tr, intro_en, sort_order, is_published) values
  ('selimiye', 'Selimiye', 'Selimiye', 'Sakin liman köyü ve Hisarönü Körfezi', 'A quiet harbour village on Hisarönü Bay',
   'Selimiye, Hisarönü Körfezi''nin kıyısında eski bir liman köyüdür. Marmaris, Bozburun ve Datça rotalarının sakin bir durağıdır.',
   'Selimiye is an old harbour village on Hisarönü Bay, a quiet stop on routes between Marmaris, Bozburun and Datça.', 8, true)
on conflict (slug) do nothing;
update public.destinations set sort_order = v.o from (values
  ('gocek',1),('fethiye',2),('bodrum',3),('marmaris',4),('datca',5),('bozburun',6),('kas-kekova',7),('selimiye',8)
) as v(s,o) where slug = v.s;

-- 3) S.S.S ve Yat ve Yatcilik Kulturu sayfalari (taslak metin; panelden duzenleyin)
insert into public.blog_posts (slug,title_tr,excerpt_tr,content_tr,title_en,excerpt_en,content_en,kind,sort_order,status,published_at) values
('sss','Sıkça Sorulan Sorular','Tekne kiralamayla ilgili en çok merak edilenler.',
$tr$
## Tekne kiralamak için yelken ya da denizcilik bilgisi gerekir mi?
Hayır. Kaptanlı ve mürettebatlı kiralamada tekneyi deneyimli bir ekip kullanır. Sizin yalnızca tatilin keyfini çıkarmanız yeterlidir. Kaptansız kiralamada belge ve deneyim şartları tekneye göre değişir.

## Mürettebatlı kiralama ne demek?
Tekne, kaptan ve ekibiyle birlikte kiralanır. Ekibin kaç kişi olduğu teknenin büyüklüğüne göre değişir. Her teknenin sayfasında personel sayısı yazılıdır.

## Fiyata neler dahil?
Dahil olanlar tekneye ve sezona göre değişir. Yakıt, kumanya, liman ücretleri ve ek hizmetlerin dahil olup olmadığı teklifte açıkça yazılır.

## Ne kadar önceden rezervasyon yapmalıyım?
Yaz sezonunun yoğun haftaları için mümkün olduğunca erken talep göndermenizi öneririz. Müsaitlik tekneye göre değişir.

## Talep göndermek ücretli mi?
Hayır. Talep göndermek ücretsiz ve bağlayıcı değildir. Ödeme, teklifi onaylayıp sözleşmeyi imzaladıktan sonra yapılır.

## Hava kötü olursa ne olur?
Güvenlik her zaman önceliktir. Kaptan, hava ve rüzgâra göre rotayı ve sırayı değiştirebilir. Ayrıntılı koşullar sözleşmenizde yer alır.

## Yemek ve içecekler nasıl planlanır?
Yolculuktan önce yemek tercihlerinizi, alerjilerinizi ve içecek isteklerinizi paylaşırsınız. Kumanya bu listeye göre hazırlanır. Süreç için [Kiralama Süreci](/kiralama-sureci) sayfasına bakabilirsiniz.

## Yurt dışına (Yunan adaları gibi) geçilebilir mi?
Bazı rotalarda mümkündür, ancak belgeler ve tarihler önceden netleştirilmelidir. Talebinizi gönderirken bu isteğinizi belirtin.

## Çocuklarla tekne tatili uygun mu?
Evet. Sığ ve sakin koylar tercih edilir. Çocukların yaşlarını talep sırasında belirtmeniz yeterlidir.

Burada yanıtını bulamadığınız bir soru için bize ulaşabilirsiniz.
$tr$,
'Frequently Asked Questions','The things people most often ask about chartering a boat.',
$en$
## Do I need sailing or seamanship experience to charter a boat?
No. On a crewed charter, an experienced team handles the boat, so all you need to do is enjoy your holiday. For bareboat charters, licence and experience requirements depend on the boat.

## What does a crewed charter mean?
The boat is chartered together with its captain and crew. The size of the crew depends on the boat. Each boat's page shows its crew numbers.

## What is included in the price?
This varies by boat and season. Whether fuel, provisions, port fees and extra services are included is stated clearly in your quote.

## How far in advance should I book?
For the busiest weeks of summer we recommend sending your request as early as possible. Availability varies by boat.

## Does sending a request cost anything?
No. Sending a request is free and non-binding. Payment is made only after you accept the quote and sign the contract.

## What if the weather is bad?
Safety always comes first. The captain may change the route and order according to weather and wind. Detailed terms are in your contract.

## How are food and drinks planned?
Before the trip you share your food preferences, allergies and drink requests, and provisioning is prepared from that list. See the [Charter Process](/en/kiralama-sureci) page for more.

## Can we cross abroad, for example to the Greek islands?
On some routes yes, but documents and dates must be settled beforehand. Please mention this when you send your request.

## Is a boat holiday suitable with children?
Yes. Shallow, calm coves are preferred. Just tell us the children's ages when you send your request.

If you can't find the answer to your question here, get in touch with us.
$en$,'page',20,'published',now()),
('yat-ve-yatcilik-kulturu','Yat ve Yatçılık Kültürü','Mavi yolculuğun kökeni, tekne türleri ve tekne tatilinin görgü kuralları.',
$tr$
## Mavi Yolculuk nereden gelir?
"Mavi Yolculuk" adı, Bodrum'da yaşamış yazar Cevat Şakir Kabaağaçlı'nın (Halikarnas Balıkçısı) Ege kıyılarında yaptığı deniz gezilerinden doğan bir kavramdır. Bugün bu ad, gulet ve benzeri teknelerle koy koy dolaşılan tatili anlatır.

## Tekne türleri
- **Gulet:** Geleneksel hatlı, geniş güverteli ahşap ya da modern yapılı tekneler. Mavi yolculuğun klasik seçimidir.
- **Motoryat:** Hızlı ve konforlu, kısa sürede daha çok koy görmek isteyenler için uygundur.
- **Yelkenli / Katamaran:** Rüzgârla ilerleme deneyimi sunar. Katamaranlar iki gövdeli olduğu için denge ve geniş yaşam alanı sağlar.
- **Lüks yat:** Geniş mürettebat ve üst düzey konfor sunan büyük tekneler.

## Teknede görgü kuralları
- Teknede çıplak ayakla ya da tekne ayakkabısıyla dolaşılır. Sert tabanlı ayakkabılar güverteye zarar verebilir.
- Kaptanın ve mürettebatın güvenlik talimatlarına uyulur.
- Su ve elektrik sınırlı kaynaklardır, tasarruflu kullanılır.
- Koylarda diğer teknelere saygı gösterilir; yüksek sesli müzik geceleri sınırlandırılır.
- Denizi ve koyları temiz bırakmak herkesin sorumluluğudur.

## Mürettebat ve bahşiş
Kaptan, aşçı ve tayfa yolculuğun parçasıdır. Mürettebata bahşiş vermek yaygın bir gelenektir; miktar ve nasıl verileceği tamamen size bağlıdır.

## Sık kullanılan denizcilik sözleri
- **Pruva:** Teknenin ön kısmı.
- **Kıç:** Teknenin arka kısmı.
- **Borda:** Teknenin yan tarafı.
- **Demirlemek:** Teknenin demirle denizde sabitlenmesi.
- **Mendirek:** Limanı dalgadan koruyan yapı.
$tr$,
'Yachts and Yachting Culture','The origins of the blue voyage, boat types and boat etiquette.',
$en$
## Where does the Blue Voyage come from?
The term "Blue Voyage" (Mavi Yolculuk) grew out of the sea trips along the Aegean coast made by Cevat Şakir Kabaağaçlı (the "Fisherman of Halicarnassus"), who lived in Bodrum. Today the name describes a holiday spent sailing from cove to cove on a gulet or similar boat.

## Boat types
- **Gulet:** Traditional-looking boats with a wide deck, in wood or modern build. The classic choice for a blue voyage.
- **Motor yacht:** Fast and comfortable, suited to those who want to see more coves in less time.
- **Sailing yacht / Catamaran:** Offers the experience of sailing by wind. Catamarans have two hulls, giving stability and generous living space.
- **Luxury yacht:** Larger boats with a bigger crew and a high level of comfort.

## Etiquette on board
- Go barefoot or wear boat shoes. Hard-soled shoes can damage the deck.
- Follow the safety instructions of the captain and crew.
- Water and electricity are limited resources, so use them sparingly.
- Be considerate to other boats in the coves; keep loud music down at night.
- Keeping the sea and coves clean is everyone's responsibility.

## Crew and tipping
The captain, cook and deckhand are part of the journey. Tipping the crew is a common custom; the amount and how you give it are entirely up to you.

## Handy nautical words
- **Bow:** The front of the boat.
- **Stern:** The back of the boat.
- **Port / Starboard:** The left and right sides of the boat.
- **To anchor:** To hold the boat in place at sea with an anchor.
- **Breakwater:** A structure protecting a harbour from waves.
$en$,'page',21,'published',now())
on conflict (slug) do nothing;
