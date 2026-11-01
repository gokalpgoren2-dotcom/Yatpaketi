-- Klasik Rotalar: 16 rota (Turkce + Ingilizce taslak). Onceki 4 taslak rota yazisi silinip yerine bunlar eklenir.
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir (ikinci seferde yazilara dokunmaz).
-- DIKKAT: Onceki taslak rotalari panelden duzenlediyseniz o duzenlemeler silinir.
delete from public.blog_posts where kind = 'route' and slug in (
  'gocek-fethiye-12-ada-rotasi','bodrum-datca-gokova-rotasi','marmaris-datca-bozburun-rotasi','fethiye-kas-kekova-rotasi');

insert into public.blog_posts (slug,title_tr,excerpt_tr,content_tr,title_en,excerpt_en,content_en,kind,sort_order,status,published_at) values
('gocek-korfezi-12-adalar','Göcek Körfezi / 12 Adalar','Göcek''ten çıkıp 12 Ada çevresinde korunaklı koylarda geçen klasik rota.','Mavi yolculuğa ilk çıkanlar için en rahat rota. Mesafeler kısa, koylar korunaklı, her gün yüzmeye zaman kalır. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Göcek''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Tersane Adası ve çevresindeki koylar: yürüyüş, yüzme ve şnorkel.
- **Gün 3:** Yassıcalar ve Kızılada çevresi: sığ turkuaz koylarda tam gün keyif.
- **Gün 4:** Bedri Rahmi Koyu ve Sarsala: sakin bir akşam.
- **Gün 5:** 12 Ada çevresinde en sevdiğiniz koya dönüş: yüzme ve dinlenme.
- **Gün 6:** Serbest gün: en güzel koyda daha uzun kalın.
- **Gün 7:** Göcek''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Göcek Bay / 12 Islands','The classic route from Göcek among the sheltered coves of the 12 Islands.','The easiest route for a first blue voyage. Distances are short, the coves are sheltered and there''s time to swim every day. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Göcek; first evening.
- **Day 2:** Tersane Island and nearby coves: walking, swimming and snorkelling.
- **Day 3:** Yassıcalar and the Kızılada area: a full day in shallow turquoise coves.
- **Day 4:** Bedri Rahmi Cove and Sarsala: a quiet evening.
- **Day 5:** Back to your favourite cove among the 12 Islands: swimming and relaxing.
- **Day 6:** A free day: stay longer in the most beautiful cove.
- **Day 7:** Last evening in Göcek; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',1,'published',now()),
('gocek-fethiye-korfezi','Göcek / Fethiye Körfezi','Göcek''ten Fethiye Körfezi''ne: 12 Ada, Gemiler ve Kelebekler Vadisi.','Göcek Körfezi''nin sakin koylarından Fethiye Körfezi''ndeki Gemiler ve Ölüdeniz''e uzanan, mavi yolculuğun klasik güzergâhı. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Göcek''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Tersane Adası ve çevresindeki koylar: yürüyüş, yüzme ve şnorkel.
- **Gün 3:** Yassıcalar ve Kızılada çevresi: sığ turkuaz koylarda tam gün keyif.
- **Gün 4:** Bedri Rahmi Koyu ve Sarsala: sakin bir akşam.
- **Gün 5:** Gemiler Adası''nda yürüyüş ve yüzme.
- **Gün 6:** Ölüdeniz ve Kelebekler Vadisi: şelale ve plaj.
- **Gün 7:** Fethiye''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Göcek / Fethiye Bay','From Göcek to Fethiye Bay: the 12 Islands, Gemiler and Butterfly Valley.','The classic blue voyage line from the calm coves of Göcek Bay to Gemiler and Ölüdeniz in Fethiye Bay. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Göcek; first evening.
- **Day 2:** Tersane Island and nearby coves: walking, swimming and snorkelling.
- **Day 3:** Yassıcalar and the Kızılada area: a full day in shallow turquoise coves.
- **Day 4:** Bedri Rahmi Cove and Sarsala: a quiet evening.
- **Day 5:** A walk and a swim at Gemiler Island.
- **Day 6:** Ölüdeniz and Butterfly Valley: waterfall and beach.
- **Day 7:** Last evening in Fethiye; breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',2,'published',now()),
('fethiye-kekova','Fethiye - Kekova','Fethiye''den doğuya: Kalkan, Kaş ve Kekova''nın batık şehri.','Daha uzun seyir mesafeleri ve daha az kalabalık duraklarla karakterli bir doğu rotası. Kekova ve batık şehir rotanın en özel anıdır. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Fethiye''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Ölüdeniz ve Kelebekler Vadisi: şelale ve plaj.
- **Gün 3:** Seyir günü: doğuya doğru uzun etap, yol boyunca yüzme molaları.
- **Gün 4:** Kalkan ve Kaş çevresi: sakin koylar.
- **Gün 5:** Meis''e bakış ve dalış molaları (Meis geçişi için belgeler önceden netleştirilir).
- **Gün 6:** Kekova: batık şehir, Kaleköy ve Üçağız.
- **Gün 7:** Kekova''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.
Yurt dışı geçişi içerir: kimlik ve belgeler, tarihler ve giriş-çıkış işlemleri talep sırasında önceden netleştirilmelidir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Fethiye - Kekova','East from Fethiye: Kalkan, Kaş and the sunken city of Kekova.','An eastbound route with longer sailing distances and less crowded stops. Kekova and the sunken city are its most special moment. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Fethiye; first evening.
- **Day 2:** Ölüdeniz and Butterfly Valley: waterfall and beach.
- **Day 3:** Sailing day: a longer leg eastwards with swim stops on the way.
- **Day 4:** Around Kalkan and Kaş: quiet coves.
- **Day 5:** A look at Meis and dive stops (documents for a Meis crossing are settled beforehand).
- **Day 6:** Kekova: the sunken city, Kaleköy and Üçağız.
- **Day 7:** Last evening in Kekova; breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.
It includes a crossing abroad: IDs and documents, dates and entry/exit formalities must be settled in advance when you send your request.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',3,'published',now()),
('fethiye-bozburun','Fethiye - Bozburun','Fethiye''den batıya: Ekincik, Marmaris ve Bozburun Yarımadası.','Fethiye Körfezi''nden Ekincik ve Marmaris üzerinden Bozburun''un sakin koylarına uzanan tek yönlü bir rota. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Fethiye''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Ölüdeniz ve Kelebekler Vadisi: şelale ve plaj.
- **Gün 3:** Seyir günü: batıya doğru uzun etap, yol boyunca yüzme molaları.
- **Gün 4:** Ekincik Koyu: sakin bir koyda yüzme ve akşam.
- **Gün 5:** Marmaris: çarşı, kale ve akşam yemeği.
- **Gün 6:** Orhaniye ve Hisarönü Körfezi koyları: sığ sular ve uzun kumsal.
- **Gün 7:** Bozburun''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Fethiye - Bozburun','West from Fethiye: Ekincik, Marmaris and the Bozburun Peninsula.','A one-way route from Fethiye Bay via Ekincik and Marmaris to the quiet coves of Bozburun. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Fethiye; first evening.
- **Day 2:** Ölüdeniz and Butterfly Valley: waterfall and beach.
- **Day 3:** Sailing day: a longer leg westwards with swim stops on the way.
- **Day 4:** Ekincik Cove: swimming and an evening in a calm cove.
- **Day 5:** Marmaris: bazaar, castle and dinner ashore.
- **Day 6:** Orhaniye and the coves of Hisarönü Bay: shallow water and a long beach.
- **Day 7:** Last evening in Bozburun; breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',4,'published',now()),
('kekova-bodrum','Kekova - Bodrum','Kekova''dan Bodrum''a: Akdeniz ile Ege''yi birleştiren uzun bir kıyı rotası.','Türkiye''nin güneybatı kıyısını baştan sona gören uzun bir rota. Etaplar uzundur ve programı hava durumu belirler. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Kekova''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Kalkan ve Kaş çevresi: sakin koylar.
- **Gün 3:** Seyir günü: batıya doğru uzun etap, yol boyunca yüzme molaları.
- **Gün 4:** Tersane Adası ve çevresindeki koylar: yürüyüş, yüzme ve şnorkel.
- **Gün 5:** Seyir günü: batıya doğru uzun etap, yol boyunca yüzme molaları.
- **Gün 6:** Knidos: antik liman ve gün batımı yürüyüşü.
- **Gün 7:** Bodrum''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Kekova - Bodrum','From Kekova to Bodrum: a long coastal route linking the Mediterranean and the Aegean.','A long route seeing the whole of Turkey''s south-west coast. The legs are long and the weather sets the programme. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Kekova; first evening.
- **Day 2:** Around Kalkan and Kaş: quiet coves.
- **Day 3:** Sailing day: a longer leg westwards with swim stops on the way.
- **Day 4:** Tersane Island and nearby coves: walking, swimming and snorkelling.
- **Day 5:** Sailing day: a longer leg westwards with swim stops on the way.
- **Day 6:** Knidos: the ancient harbour and a sunset walk.
- **Day 7:** Last evening in Bodrum; breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',5,'published',now()),
('marmaris-ekincik-fethiye','Marmaris - Ekincik - Fethiye','Marmaris''ten Ekincik ve Dalyan çevresine, oradan Göcek ve Fethiye''ye.','Marmaris''in korunaklı limanından başlayıp Ekincik Koyu''na, oradan Göcek ve Fethiye Körfezi''ne uzanan tek yönlü rota. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Marmaris''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Orhaniye ve Hisarönü Körfezi koyları: sığ sular ve uzun kumsal.
- **Gün 3:** Ekincik Koyu: sakin bir koyda yüzme ve akşam.
- **Gün 4:** Ekincik''ten isteğe bağlı Dalyan gezisi ya da serbest gün.
- **Gün 5:** Seyir günü: doğuya doğru uzun etap, yol boyunca yüzme molaları.
- **Gün 6:** Yassıcalar ve Kızılada çevresi: sığ turkuaz koylarda tam gün keyif.
- **Gün 7:** Fethiye''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Marmaris - Ekincik - Fethiye','From Marmaris to Ekincik and Dalyan, then on to Göcek and Fethiye.','A one-way route starting from Marmaris'' sheltered harbour via Ekincik Cove to Göcek and Fethiye Bay. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Marmaris; first evening.
- **Day 2:** Orhaniye and the coves of Hisarönü Bay: shallow water and a long beach.
- **Day 3:** Ekincik Cove: swimming and an evening in a calm cove.
- **Day 4:** An optional Dalyan trip from Ekincik, or a free day.
- **Day 5:** Sailing day: a longer leg eastwards with swim stops on the way.
- **Day 6:** Yassıcalar and the Kızılada area: a full day in shallow turquoise coves.
- **Day 7:** Last evening in Fethiye; breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',6,'published',now()),
('marmaris-hisaronu-korfezi','Marmaris - Hisarönü Körfezi','Marmaris çıkışlı, Hisarönü Körfezi''nin sakin koyları ve Bozburun Yarımadası.','Kalabalıktan uzak, dingin koyları ve kısa mesafeleriyle rahat bir rota. Marmaris''te başlayıp Marmaris''te biter. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Marmaris''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Orhaniye ve Hisarönü Körfezi koyları: sığ sular ve uzun kumsal.
- **Gün 3:** Selimiye ve Bozburun Yarımadası: eski liman köyünde akşam yemeği.
- **Gün 4:** Sömbeki Koyu: berrak su ve sessizlik.
- **Gün 5:** Söğüt çevresi: kalabalıktan uzak sakin koylar.
- **Gün 6:** Serbest gün: en güzel koyda daha uzun kalın.
- **Gün 7:** Marmaris''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Marmaris - Hisarönü Bay','From Marmaris, the quiet coves of Hisarönü Bay and the Bozburun Peninsula.','A comfortable route with calm coves away from the crowds and short distances. It starts and ends in Marmaris. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Marmaris; first evening.
- **Day 2:** Orhaniye and the coves of Hisarönü Bay: shallow water and a long beach.
- **Day 3:** Selimiye and the Bozburun Peninsula: dinner in an old harbour village.
- **Day 4:** Sömbeki Cove: clear water and silence.
- **Day 5:** Around Söğüt: quiet coves away from the crowds.
- **Day 6:** A free day: stay longer in the most beautiful cove.
- **Day 7:** Last evening in Marmaris; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',7,'published',now()),
('bozburun-bodrum','Bozburun - Bodrum','Bozburun''dan Datça Yarımadası ve Gökova üzerinden Bodrum''a.','Sakin Bozburun koylarından Knidos''a, oradan Gökova Körfezi''ne ve Bodrum''un canlılığına uzanan tek yönlü rota. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Bozburun''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Sömbeki Koyu: berrak su ve sessizlik.
- **Gün 3:** Datça: liman kasabasında akşam yemeği.
- **Gün 4:** Knidos: antik liman ve gün batımı yürüyüşü.
- **Gün 5:** Gökova Körfezi: Cennet Adası ve Sedir Adası çevresi.
- **Gün 6:** Karaada ve Orak Adası: sıcak sulu mağara ve berrak koylar.
- **Gün 7:** Bodrum''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Bozburun - Bodrum','From Bozburun via the Datça Peninsula and Gökova to Bodrum.','A one-way route from the quiet coves of Bozburun to Knidos, then through Gökova Bay to lively Bodrum. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Bozburun; first evening.
- **Day 2:** Sömbeki Cove: clear water and silence.
- **Day 3:** Datça: dinner in the harbour town.
- **Day 4:** Knidos: the ancient harbour and a sunset walk.
- **Day 5:** Gökova Bay: around Cennet Island and Sedir Island.
- **Day 6:** Karaada and Orak Island: a hot-spring cave and clear coves.
- **Day 7:** Last evening in Bodrum; breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',8,'published',now()),
('bozburun-hisaronu-korfezi','Bozburun - Hisarönü Körfezi','Bozburun''dan çıkıp Hisarönü Körfezi''nde sakin koylar.','Geleneksel gulet yapımıyla bilinen Bozburun''dan başlayan, tamamen sakin koylar arasında geçen kısa mesafeli bir rota. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Bozburun''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Sömbeki Koyu: berrak su ve sessizlik.
- **Gün 3:** Selimiye ve Bozburun Yarımadası: eski liman köyünde akşam yemeği.
- **Gün 4:** Söğüt çevresi: kalabalıktan uzak sakin koylar.
- **Gün 5:** Orhaniye ve Hisarönü Körfezi koyları: sığ sular ve uzun kumsal.
- **Gün 6:** Serbest gün: en güzel koyda daha uzun kalın.
- **Gün 7:** Bozburun''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Bozburun - Hisarönü Bay','From Bozburun, calm coves around Hisarönü Bay.','Starting from Bozburun, known for traditional gulet building, a short-distance route among calm coves. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Bozburun; first evening.
- **Day 2:** Sömbeki Cove: clear water and silence.
- **Day 3:** Selimiye and the Bozburun Peninsula: dinner in an old harbour village.
- **Day 4:** Around Söğüt: quiet coves away from the crowds.
- **Day 5:** Orhaniye and the coves of Hisarönü Bay: shallow water and a long beach.
- **Day 6:** A free day: stay longer in the most beautiful cove.
- **Day 7:** Last evening in Bozburun; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',9,'published',now()),
('bodrum-datca-hisaronu-korfezi','Bodrum - Datça - Hisarönü Körfezi','Bodrum''dan Knidos ve Datça''ya, oradan Hisarönü Körfezi''ne.','Canlı Bodrum ile başlayıp Datça Yarımadası''nın ucundaki Knidos''tan Hisarönü Körfezi''nin sakin koylarına uzanan tek yönlü rota. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Bodrum''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Karaada ve Orak Adası: sıcak sulu mağara ve berrak koylar.
- **Gün 3:** Datça: liman kasabasında akşam yemeği.
- **Gün 4:** Knidos: antik liman ve gün batımı yürüyüşü.
- **Gün 5:** Orhaniye ve Hisarönü Körfezi koyları: sığ sular ve uzun kumsal.
- **Gün 6:** Selimiye ve Bozburun Yarımadası: eski liman köyünde akşam yemeği.
- **Gün 7:** Hisarönü Körfezi''nde (Marmaris ya da Bozburun) son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Bodrum - Datça - Hisarönü Bay','From Bodrum to Knidos and Datça, then on to Hisarönü Bay.','A one-way route starting in lively Bodrum, passing Knidos at the tip of the Datça Peninsula and reaching the quiet coves of Hisarönü Bay. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Bodrum; first evening.
- **Day 2:** Karaada and Orak Island: a hot-spring cave and clear coves.
- **Day 3:** Datça: dinner in the harbour town.
- **Day 4:** Knidos: the ancient harbour and a sunset walk.
- **Day 5:** Orhaniye and the coves of Hisarönü Bay: shallow water and a long beach.
- **Day 6:** Selimiye and the Bozburun Peninsula: dinner in an old harbour village.
- **Day 7:** Last evening in Hisarönü Bay (Marmaris or Bozburun); breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',10,'published',now()),
('bodrum-yunan-adalari','Bodrum - Yunan Adaları','Bodrum''dan Kos''a kısa geçiş ve Ege''nin Yunan adaları.','Bodrum çevresindeki koylardan Kos''a geçen ve Türkiye''ye dönen rota. Yurt dışı geçişi nedeniyle belgeler ve tarihler önceden netleştirilmelidir. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Bodrum''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Karaada ve Orak Adası: sıcak sulu mağara ve berrak koylar.
- **Gün 3:** Yunan adası Kos''a geçiş (belgeler ve giriş-çıkış işlemleri önceden netleştirilir).
- **Gün 4:** Kos''ta serbest gün: liman, çarşı ve koylar.
- **Gün 5:** Türkiye''ye dönüş: giriş işlemleri ve sakin bir koyda akşam.
- **Gün 6:** Yalıkavak ve Gümüşlük: gün batımı ve balık yemeği.
- **Gün 7:** Bodrum''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Yurt dışı geçişi içerir: kimlik ve belgeler, tarihler ve giriş-çıkış işlemleri talep sırasında önceden netleştirilmelidir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Bodrum - Greek Islands','From Bodrum, a short crossing to Kos and the Greek islands of the Aegean.','A route from the coves around Bodrum across to Kos and back to Turkey. Because it involves a crossing abroad, documents and dates must be settled beforehand. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Bodrum; first evening.
- **Day 2:** Karaada and Orak Island: a hot-spring cave and clear coves.
- **Day 3:** Crossing to the Greek island of Kos (documents and entry/exit formalities are settled beforehand).
- **Day 4:** A free day on Kos: harbour, town and coves.
- **Day 5:** Back to Turkey: entry formalities and an evening in a calm cove.
- **Day 6:** Yalıkavak and Gümüşlük: sunset and a fish dinner.
- **Day 7:** Last evening in Bodrum; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

It includes a crossing abroad: IDs and documents, dates and entry/exit formalities must be settled in advance when you send your request.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',11,'published',now()),
('marmaris-yunan-adalari','Marmaris - Yunan Adaları','Marmaris''ten Rodos ve Symi''ye, Ege''nin Yunan adaları.','Marmaris''ten Rodos''a geçen, Symi üzerinden Türkiye''ye dönen rota. Yurt dışı geçişi nedeniyle belgeler ve tarihler önceden netleştirilmelidir. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Marmaris''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Orhaniye ve Hisarönü Körfezi koyları: sığ sular ve uzun kumsal.
- **Gün 3:** Yunan adası Rodos''a geçiş (belgeler ve giriş-çıkış işlemleri önceden netleştirilir).
- **Gün 4:** Rodos''ta serbest gün: eski şehir ve liman.
- **Gün 5:** Yunan adası Symi''de renkli liman ve akşam yemeği (belgeler önceden netleştirilir).
- **Gün 6:** Türkiye''ye dönüş: giriş işlemleri ve sakin bir koyda akşam.
- **Gün 7:** Marmaris''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Yurt dışı geçişi içerir: kimlik ve belgeler, tarihler ve giriş-çıkış işlemleri talep sırasında önceden netleştirilmelidir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Marmaris - Greek Islands','From Marmaris to Rhodes and Symi, Greek islands of the Aegean.','A route from Marmaris across to Rhodes and back to Turkey via Symi. Because it involves a crossing abroad, documents and dates must be settled beforehand. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Marmaris; first evening.
- **Day 2:** Orhaniye and the coves of Hisarönü Bay: shallow water and a long beach.
- **Day 3:** Crossing to the Greek island of Rhodes (documents and entry/exit formalities are settled beforehand).
- **Day 4:** A free day on Rhodes: the old town and harbour.
- **Day 5:** The colourful harbour of the Greek island of Symi and dinner ashore (documents are settled beforehand).
- **Day 6:** Back to Turkey: entry formalities and an evening in a calm cove.
- **Day 7:** Last evening in Marmaris; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

It includes a crossing abroad: IDs and documents, dates and entry/exit formalities must be settled in advance when you send your request.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',12,'published',now()),
('datca-yunan-adalari','Datça - Yunan Adaları','Datça''dan Symi ve Rodos''a, Ege''nin Yunan adaları.','Datça Yarımadası''ndan Symi''ye ve Rodos''a geçen, Datça''ya dönen rota. Yurt dışı geçişi nedeniyle belgeler ve tarihler önceden netleştirilmelidir. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Datça''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Knidos: antik liman ve gün batımı yürüyüşü.
- **Gün 3:** Yunan adası Symi''de renkli liman ve akşam yemeği (belgeler önceden netleştirilir).
- **Gün 4:** Yunan adası Rodos''a geçiş (belgeler ve giriş-çıkış işlemleri önceden netleştirilir).
- **Gün 5:** Rodos''ta serbest gün: eski şehir ve liman.
- **Gün 6:** Türkiye''ye dönüş: giriş işlemleri ve sakin bir koyda akşam.
- **Gün 7:** Datça''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Yurt dışı geçişi içerir: kimlik ve belgeler, tarihler ve giriş-çıkış işlemleri talep sırasında önceden netleştirilmelidir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Datça - Greek Islands','From Datça to Symi and Rhodes, Greek islands of the Aegean.','A route from the Datça Peninsula to Symi and Rhodes and back to Datça. Because it involves a crossing abroad, documents and dates must be settled beforehand. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Datça; first evening.
- **Day 2:** Knidos: the ancient harbour and a sunset walk.
- **Day 3:** The colourful harbour of the Greek island of Symi and dinner ashore (documents are settled beforehand).
- **Day 4:** Crossing to the Greek island of Rhodes (documents and entry/exit formalities are settled beforehand).
- **Day 5:** A free day on Rhodes: the old town and harbour.
- **Day 6:** Back to Turkey: entry formalities and an evening in a calm cove.
- **Day 7:** Last evening in Datça; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

It includes a crossing abroad: IDs and documents, dates and entry/exit formalities must be settled in advance when you send your request.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',13,'published',now()),
('bodrum-yarimadasi','Bodrum Yarımadası','Bodrum çevresindeki koylar, adalar ve yarımadanın batısı.','Bodrum Yarımadası''nın koylarını ve adalarını kısa mesafelerle gezen, Bodrum''da başlayıp biten rota. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Bodrum''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Karaada ve Orak Adası: sıcak sulu mağara ve berrak koylar.
- **Gün 3:** Yalıkavak ve Gümüşlük: gün batımı ve balık yemeği.
- **Gün 4:** Serbest gün: en güzel koyda daha uzun kalın.
- **Gün 5:** Yalıkavak ve Gümüşlük: gün batımı ve balık yemeği.
- **Gün 6:** Serbest gün: en güzel koyda daha uzun kalın.
- **Gün 7:** Bodrum''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Bodrum Peninsula','The coves, islands and west of the peninsula around Bodrum.','A short-distance route around the coves and islands of the Bodrum Peninsula, starting and ending in Bodrum. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Bodrum; first evening.
- **Day 2:** Karaada and Orak Island: a hot-spring cave and clear coves.
- **Day 3:** Yalıkavak and Gümüşlük: sunset and a fish dinner.
- **Day 4:** A free day: stay longer in the most beautiful cove.
- **Day 5:** Yalıkavak and Gümüşlük: sunset and a fish dinner.
- **Day 6:** A free day: stay longer in the most beautiful cove.
- **Day 7:** Last evening in Bodrum; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',14,'published',now()),
('bodrum-gokova-korfezi-rotasi','Bodrum - Gökova Körfezi','Bodrum''dan Gökova''nın sakin koylarına, Cennet ve Sedir Adası.','Bodrum''un canlılığıyla Gökova''nın sessizliğini tek rotada buluşturan, Bodrum''da başlayıp biten rota. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Bodrum''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Karaada ve Orak Adası: sıcak sulu mağara ve berrak koylar.
- **Gün 3:** Gökova Körfezi: Cennet Adası ve Sedir Adası çevresi.
- **Gün 4:** Gökova Körfezi: Cennet Adası ve Sedir Adası çevresi.
- **Gün 5:** Gökova''nın ucunda Akyaka: yeşil ve sakin bir akşam.
- **Gün 6:** Serbest gün: en güzel koyda daha uzun kalın.
- **Gün 7:** Bodrum''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Aileler, arkadaş grupları ve rotayı bir limandan başlayıp aynı limanda bitirmek isteyenler.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Bodrum - Gökova Bay','From Bodrum to the calm coves of Gökova, Cennet Island and Sedir Island.','A route that brings together Bodrum''s energy and Gökova''s silence, starting and ending in Bodrum. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Bodrum; first evening.
- **Day 2:** Karaada and Orak Island: a hot-spring cave and clear coves.
- **Day 3:** Gökova Bay: around Cennet Island and Sedir Island.
- **Day 4:** Gökova Bay: around Cennet Island and Sedir Island.
- **Day 5:** Akyaka at the head of Gökova: a green, peaceful evening.
- **Day 6:** A free day: stay longer in the most beautiful cove.
- **Day 7:** Last evening in Bodrum; breakfast and hand-over the next morning.

## Who is it for?
Families, groups of friends and anyone who wants to start and finish in the same port.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',15,'published',now()),
('bodrum-gocek','Bodrum - Göcek','Bodrum''dan Datça ve Marmaris üzerinden Göcek''e uzanan Ege-Akdeniz rotası.','Ege kıyısındaki Bodrum''dan Datça Yarımadası ve Marmaris üzerinden Göcek''e uzanan tek yönlü rota. Etaplar uzundur ve programı hava durumu belirler. Aşağıdaki program örnektir; rüzgâr ve hava durumuna göre kaptanınız sırayı değiştirebilir.

## Gün gün
- **Gün 1:** Bodrum''te karşılama, yerleşme, kumanya ve ilk akşam.
- **Gün 2:** Knidos: antik liman ve gün batımı yürüyüşü.
- **Gün 3:** Datça: liman kasabasında akşam yemeği.
- **Gün 4:** Marmaris: çarşı, kale ve akşam yemeği.
- **Gün 5:** Ekincik Koyu: sakin bir koyda yüzme ve akşam.
- **Gün 6:** Tersane Adası ve çevresindeki koylar: yürüyüş, yüzme ve şnorkel.
- **Gün 7:** Göcek''te son akşam; son sabah kahvaltı ve teslim.

## Kimlere uygun?
Seyri seven, farklı bir rota arayan gruplar.
Çoğu zaman tek yönlü (bir limandan alıp başka bir limanda teslim) planlanır; bu durum tekneye göre ek masraf getirebilir.

Rota seçiminde yardıma ihtiyacınız olursa talep formundan bize yazın. Çıkış limanlarına [Limanlar](/limanlar) sayfasından bakabilirsiniz.','Bodrum - Göcek','From Bodrum via Datça and Marmaris to Göcek along the Aegean and Mediterranean.','A one-way route from Bodrum on the Aegean via the Datça Peninsula and Marmaris to Göcek. The legs are long and the weather sets the programme. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome, settling in and provisioning in Bodrum; first evening.
- **Day 2:** Knidos: the ancient harbour and a sunset walk.
- **Day 3:** Datça: dinner in the harbour town.
- **Day 4:** Marmaris: bazaar, castle and dinner ashore.
- **Day 5:** Ekincik Cove: swimming and an evening in a calm cove.
- **Day 6:** Tersane Island and nearby coves: walking, swimming and snorkelling.
- **Day 7:** Last evening in Göcek; breakfast and hand-over the next morning.

## Who is it for?
Groups who enjoy sailing and want a different route.
It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.

If you need help choosing a route, write to us through the request form. You can see the departure ports on the [Ports](/en/limanlar) page.','route',16,'published',now())
on conflict (slug) do nothing;
