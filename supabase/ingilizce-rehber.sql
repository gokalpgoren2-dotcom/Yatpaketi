-- Ingilizce site: yazilar tablosuna Ingilizce alanlar + rehber icerigi Ingilizce taslaklari
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir (dolu Ingilizce alanlara dokunmaz).
alter table public.blog_posts add column if not exists title_en text;
alter table public.blog_posts add column if not exists excerpt_en text;
alter table public.blog_posts add column if not exists content_en text;
alter table public.blog_posts add column if not exists seo_title_en text;
alter table public.blog_posts add column if not exists seo_description_en text;

update public.blog_posts set title_en='Göcek and the 12 Islands', excerpt_en='Sheltered coves and closely spaced islands make this the easiest starting point for a blue voyage.', content_en='Göcek Bay is one of the most popular regions for a blue voyage, with calm water and coves just a short hop apart. The group known as the "12 Islands" offers sheltered anchorages on most days.

## What to see
- **Tersane Island:** Byzantine ruins, and a good stop for a walk and a swim.
- **Yassıcalar and the Kızılada area:** Clear, shallow turquoise coves, great for swimming and snorkelling.
- **Bedri Rahmi Cove and Sarsala:** Quiet coves, loved for overnight anchoring.
- **Göcek Marina:** A handy harbour for topping up provisions and having dinner ashore.

## Best time
From late May to mid-October the sea is warm. July and August are busy; June and September are both calmer and warm.

## Tip
Because the coves are so close together, you don''t need to re-anchor often. That leaves more time for swimming, sunbathing and simply enjoying the boat.

Find boats departing from Göcek on the [Ports](/en/limanlar/gocek) page.' where slug='gocek-12-ada' and (title_en is null or title_en='');
update public.blog_posts set title_en='Ölüdeniz and Butterfly Valley', excerpt_en='A cliff-lined valley, a waterfall and St. Nicholas Island: the best-known stops on Fethiye routes.', content_en='Butterfly Valley lies south of Fethiye Bay, just beyond Ölüdeniz. It is hard to reach by land, so arriving by boat is both the easiest and the most beautiful way.

## What to see
- **Butterfly Valley:** A small beach between steep cliffs and a waterfall inside the valley. A short trail leads in for those who want to hike.
- **Ölüdeniz Lagoon:** A calm, narrow lagoon. It is often crowded during the day, so go early in the morning or in the afternoon.
- **Gemiler Island:** An island with Byzantine-era buildings, easy to explore on foot and very photogenic.

## Best time
Late April to late October. In summer, go early in the morning to avoid the midday crowds.

## Tip
The sea can be choppy as you approach the valley. Your captain will choose the most comfortable anchorage according to the wind.' where slug='oludeniz-kelebekler-vadisi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Kekova and the Sunken City', excerpt_en='Ancient ruins submerged in the sea and quiet villages along the shore make for an unforgettable route.', content_en='Kekova lies between Kaş and Demre, sheltered behind a long island. Its calm water and ancient remains make it one of the quietest stops on a blue voyage.

## What to see
- **The sunken city (Simena):** Ancient structures partly submerged by an old earthquake. The site is protected, and swimming or diving over it is forbidden; boats pass slowly above and the ruins can be seen through the water.
- **Kaleköy:** The best-known village in the area, with a castle on the hill. You can walk up to the castle, and there are small restaurants below.
- **Üçağız:** A quiet little fishing village, lovely for dinner and a short walk.

## Best time
May to October. The light on Kaleköy at sunset is especially beautiful.

## Tip
Protected-area rules change often. Your captain knows the current rules for the area, so follow his or her guidance on swimming and anchoring.' where slug='kekova-batik-sehir' and (title_en is null or title_en='');
update public.blog_posts set title_en='Knidos and the Datça Peninsula', excerpt_en='A thin peninsula where the Aegean meets the Mediterranean: an ancient harbour, quiet coves and clean water.', content_en='The Datça Peninsula is a long, narrow strip of land separating two bays: Gökova to the north and Hisarönü to the south. Knidos, at its tip, is one of the most special stops on a blue voyage.

## What to see
- **Knidos:** An ancient city with two harbours. You can visit the theatre, temple remains and the buildings by the harbour. A walk at sunset is especially pleasant.
- **Datça town:** A small, quiet harbour town known for its almonds and olive products.
- **Hayıtbükü and surroundings:** Calm, clean coves for swimming.

## Best time
May–June and September–October are easier in terms of wind and crowds. The wind can pick up at the tip of the peninsula, so the sailing plan follows the weather.

## Tip
If you want to anchor at Knidos for the evening, talk to your captain beforehand, as it depends on conditions.

Find boats departing from Datça on the [Ports](/en/limanlar/datca) page.' where slug='knidos-datca' and (title_en is null or title_en='');
update public.blog_posts set title_en='Gökova Bay', excerpt_en='A long, deep, calm bay: Cennet Island, Sedir Island and coves surrounded by nature.', content_en='Gökova is a wide bay stretching between Bodrum and Datça. With green mountains to the north and small islands scattered inside, it is ideal for a quiet blue voyage.

## What to see
- **Cennet (Paradise) Island:** A calm island covered in pine trees, with shallow coves.
- **Sedir Island (Cleopatra Island):** Known for its white sand and also home to ancient ruins. Current entry rules apply.
- **Akyaka and Karacasöğüt:** Green, peaceful settlements at the head of the bay.

## Best time
May to October. The inner bay is usually calm, so spring and autumn can be lovely too.

## Tip
Light pollution is low, so the night sky is very clear and it''s a great area for stargazing.' where slug='gokova-korfezi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Bozburun and Sömbeki', excerpt_en='A quiet peninsula where traditional gulet building continues, with clean coves.', content_en='The Bozburun Peninsula lies between Marmaris and Datça, on the edge of Hisarönü Bay. The town of Bozburun is known for handmade wooden gulets, and you can see these traditional boats being built in its harbour.

## What to see
- **Bozburun town:** A small marina, fish restaurants and gulet yards.
- **Sömbeki Cove:** A calm, very clear cove in the south of the peninsula.
- **Selimiye:** An old harbour village and a lovely stop for dinner.

## Best time
May to October. Even in midsummer the area is quieter than Marmaris and Bodrum.

## Tip
If you''re interested in gulet building, ask your captain to plan a stop during the day to see work in a yard.

Find boats departing from Bozburun on the [Ports](/en/limanlar/bozburun) page.' where slug='bozburun-sombeki' and (title_en is null or title_en='');
update public.blog_posts set title_en='Kaş and Meis Island', excerpt_en='Crystal-clear water, dive sites and a short hop to the Greek island of Meis.', content_en='Kaş is a small, lively harbour town west of Antalya, where mountains and sea meet. It is known for the island of Meis (Kastellorizo) directly opposite.

## What to see
- **Kaş old town and harbour:** Narrow streets, small shops and cafés by the sea.
- **Meis Island:** A Greek island with colourful houses and a small harbour. A passport is required to cross, and the rules for day trips change by season, so talk to the boat''s captain beforehand.
- **Dive sites:** Clear water and underwater caves attract divers.

## Best time
May to October. From June onwards the sea is warm enough for comfortable swimming.

## Tip
For crossings abroad such as Meis, dates and documents need to be settled in advance. Please tell us about this when you send your request.' where slug='kas-meis' and (title_en is null or title_en='');
update public.blog_posts set title_en='Bodrum and the Surrounding Coves', excerpt_en='A lively start with nightlife, an ancient city and the freshness of the Aegean.', content_en='Bodrum is one of the liveliest spots on the Aegean coast, known for its nightlife, castle and marina. Once you set out by boat, you can explore the quiet coves and islands around it.

## What to see
- **Bodrum Castle:** A historic castle next to the marina, beautiful from the sea.
- **Karaada:** A small island of volcanic origin, known for its hot-spring cave and mud baths.
- **Orak Island:** Loved for a swim stop thanks to its beach and clear water.
- **Yalıkavak and Gümüşlük:** On the west of the peninsula, popular for sunsets and fish dinners.

## Best time
May to October. Bodrum is very lively and crowded in July and August; June and September suit those who want calm.

## Tip
Routes from Bodrum lead to Datça, Gökova and the Greek islands. Please tell us beforehand if you want to cross abroad.

Find boats departing from Bodrum on the [Ports](/en/limanlar/bodrum) page.' where slug='bodrum-adalari' and (title_en is null or title_en='');
update public.blog_posts set title_en='Marmaris and Hisarönü Bay', excerpt_en='Orhaniye, Turunç and Selimiye: the quiet coves around Marmaris.', content_en='With its wide, sheltered harbour, Marmaris is one of the most practical starting points for a blue voyage. The surrounding Hisarönü Bay offers many different coves within a short distance.

## What to see
- **Orhaniye:** A cove with a long, shallow beach, great for swimming.
- **Turunç and İçmeler:** Lively coastal settlements near Marmaris.
- **Selimiye:** An old harbour village with quiet dinners.
- **Hisarönü and the Bozburun peninsula:** Quieter coves away from the crowds.

## Best time
May to October. Marmaris'' inner harbour is very sheltered, so routes also run comfortably in spring and autumn.

## Tip
Routes from Marmaris lead to Datça, Bozburun and towards Rhodes. Please tell us beforehand if you want to cross abroad.

Find boats departing from Marmaris on the [Ports](/en/limanlar/marmaris) page.' where slug='marmaris-hisaronu' and (title_en is null or title_en='');
update public.blog_posts set title_en='Göcek – Fethiye 12 Islands Route (7 nights)', excerpt_en='The classic blue voyage: sheltered coves, Tersane Island, Gemiler and Butterfly Valley.', content_en='The easiest and most popular route for first-timers. Distances are short, the coves are sheltered, and there''s time to swim every day. The programme below is an example; your captain may change the order according to wind and weather.

## Day by day
- **Day 1:** Welcome and settling in at Göcek. First anchorage and dinner in a nearby cove in the evening.
- **Day 2:** Tersane Island and nearby coves. Walking, swimming and snorkelling.
- **Day 3:** Yassıcalar and the Kızılada area. A full day in shallow turquoise coves.
- **Day 4:** Bedri Rahmi Cove and Sarsala. A quiet evening.
- **Day 5:** Crossing to Fethiye Bay. A walk on Gemiler Island.
- **Day 6:** Ölüdeniz and Butterfly Valley. Waterfall and beach.
- **Day 7:** Return to Fethiye and a last evening.
- **Last morning:** Breakfast and hand-over.

## Who is it for?
Families, groups of friends and first-time charterers. Because the legs are short, it is also comfortable for those prone to seasickness.

## Duration and distance
Daily sailing time rarely exceeds a few hours. Most days are half a day of sailing and half a day resting in a cove.' where slug='gocek-fethiye-12-ada-rotasi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Bodrum – Datça – Gökova Route (7 nights)', excerpt_en='From Bodrum''s lively harbour to Knidos, then back through the calm coves of Gökova.', content_en='This route leaves Bodrum for Knidos at the tip of the Datça Peninsula, then returns via Gökova Bay. It suits those who like a balance of lively and quiet places. The programme is an example and may change with the weather.

## Day by day
- **Day 1:** Welcome in Bodrum, provisioning and the first evening.
- **Day 2:** Around Bodrum: Karaada and Orak Island.
- **Day 3:** Sailing towards Datça; evening in a quiet cove.
- **Day 4:** Knidos: the ancient harbour and a sunset walk.
- **Day 5:** Stop at Datça and cross to Gökova.
- **Day 6:** Cennet Island and Sedir Island area.
- **Day 7:** Return to Bodrum.

## Who is it for?
Groups who don''t mind longer sailing days and want to see varied scenery. The wind can pick up at the tip of Datça, so the weather window should be chosen carefully.

## Tip
The order may change because of the wind. A flexible programme lets you stay longer in the most beautiful coves.' where slug='bodrum-datca-gokova-rotasi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Marmaris – Datça – Bozburun Route (7 nights)', excerpt_en='The quiet coves of Hisarönü Bay, the Bozburun peninsula and the tip of Datça.', content_en='One of the classic routes from Marmaris. It combines peaceful coves away from the crowds, Bozburun (known for traditional gulet building) and the Datça Peninsula.

## Day by day
- **Day 1:** Welcome in Marmaris, provisioning and a first evening in a nearby cove.
- **Day 2:** Orhaniye and the coves of Hisarönü Bay.
- **Day 3:** Selimiye and the Bozburun peninsula.
- **Day 4:** Sömbeki Cove and surroundings: clear water and silence.
- **Day 5:** Sailing towards Datça; dinner in Datça.
- **Day 6:** A short visit to Knidos and the way back.
- **Day 7:** Return to Marmaris.

## Who is it for?
People who like quiet, natural coves and those chartering for the second time. Sailing days can be long, so the daily plan should be discussed beforehand.' where slug='marmaris-datca-bozburun-rotasi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Fethiye – Kaş – Kekova Route (7 nights)', excerpt_en='An eastbound route from Fethiye to Kekova: Patara, Kalkan, Kaş and the sunken city.', content_en='This route heads east from Fethiye and is defined by longer sailing distances and less crowded stops. Kekova and the sunken city are its most special moment. The programme is an example; the order below may change with weather and wind.

## Day by day
- **Day 1:** Welcome and settling in at Fethiye.
- **Day 2:** Ölüdeniz and Butterfly Valley.
- **Day 3:** Sailing east; quiet coves and open-water swim stops.
- **Day 4:** Around Kalkan and Kaş.
- **Day 5:** A look at Meis and dive stops (documents for a Meis crossing are settled beforehand).
- **Day 6:** Kekova: the sunken city, Kaleköy and Üçağız.
- **Day 7:** Final evening in Kaş or Kekova; transfer and hand-over.

## Who is it for?
Groups who enjoy sailing and want a quieter, different route. It is often planned as one-way (pick-up in one port, drop-off in another), which may bring an extra cost depending on the boat.' where slug='fethiye-kas-kekova-rotasi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Weekend Escape', excerpt_en='A short 2–3 night blue voyage for those who want to leave the city and rest at sea.', content_en='A 2–3 night package for first-timers or anyone who wants a short break. You don''t need a big group; it works nicely for a small party too.

## What can be included?
- Boat and crew (captain, and cook and deckhand where needed)
- Fuel included or excluded depending on the boat
- Anchoring and swim stops in nearby coves
- Breakfast and lunch options

## Who is it for?
A weekend or long weekend, a short romantic escape or a small group of friends.

Prices vary by boat, season and route. Fill in the request form for current information and a quote.' where slug='hafta-sonu-kacamagi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Classic Blue Voyage (7 nights)', excerpt_en='A full week, everything planned: boat, route and comfort.', content_en='The most popular package. For a week, days pass with a few hours of sailing, plenty of swimming and evenings anchored in different coves.

## What can be included?
- Boat and crew (captain, cook, deckhand)
- Planning one of the classic routes (from Göcek, Bodrum or Marmaris)
- Breakfast, lunch and dinner options
- Water sports equipment (depending on the boat)

## Who is it for?
Families, groups of friends, first-time blue voyagers and anyone who wants to spend their whole holiday at sea.

Prices vary by boat, season and route. Fill in the request form for a current quote. If you need help choosing a route, take a look at the [Classic Routes](/en/rotalar) page.' where slug='klasik-mavi-yolculuk' and (title_en is null or title_en='');
update public.blog_posts set title_en='Romantic Getaway', excerpt_en='A small, quiet and private blue voyage for couples.', content_en='A small boat, calm coves and dinners for two at sunset. A package prepared for couples, honeymooners or anniversaries.

## What can be arranged?
- Quiet, uncrowded coves
- A special dinner and sunset anchoring
- Decorations, cake, flowers and other special requests on board
- Surprises agreed in advance with the captain

## Who is it for?
Couples, honeymooners, anniversaries and anyone planning a proposal.

Write your special requests in your request. Prices vary by boat and season; fill in the request form for a current quote.' where slug='romantik-kacamak' and (title_en is null or title_en='');
update public.blog_posts set title_en='Family and Friends Holiday', excerpt_en='A comfortable, shared blue voyage for larger groups, based on the number of cabins.', content_en='A package prepared for families and groups of friends with attention to cabins and comfort. For families with children, safe, shallow and calm coves are preferred.

## What can be arranged?
- A cabin layout to suit your group size
- Shallow coves, life jackets and on-board activities for children
- Meal preferences, vegetarian options and special cases such as allergies
- Water toys and shared entertainment equipment

## Who is it for?
Families with children, large family gatherings and groups of friends.

Meal preferences, allergies and the children''s ages should be given when you send your request. Prices vary by boat and season; fill in the request form for a current quote.' where slug='aile-ve-arkadas-tatili' and (title_en is null or title_en='');
update public.blog_posts set title_en='Special Occasions and Corporate Events', excerpt_en='Boat days prepared for birthdays, celebrations and team get-togethers.', content_en='For a birthday, celebration, team get-together or small event, you can charter the boat privately for a few hours or the whole day.

## What can be arranged?
- Day trips to coves and celebrations
- Music, decorations and a special menu
- A boat chosen to suit your group size
- A balance of work and relaxation for corporate teams

## Who is it for?
Birthdays, celebrations and small corporate groups.

The number of guests, times and requests should be given when you send your request. Prices vary by boat and number of days; fill in the request form for a current quote.' where slug='ozel-gun-paketi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Send your request', excerpt_en='Start with your dates, number of guests and a route idea.', content_en='From a boat page or the general request form, tell us when you want to go, how many of you there are and which area you''re looking at. It''s fine if you don''t have a clear route in mind; we''ll work it out together.

You don''t need to pay anything at this stage. Sending a request doesn''t commit you.' where slug='talep' and (title_en is null or title_en='');
update public.blog_posts set title_en='Availability and quote', excerpt_en='We quickly confirm suitable boats and prices for you.', content_en='We check whether the boat and crew are available on your dates and send you suitable options and pricing. Prices vary by boat, season, route and length of the trip.

At this stage the route, cabin layout and any extra requests are discussed.' where slug='musaitlik-teklif' and (title_en is null or title_en='');
update public.blog_posts set title_en='Confirmation and contract', excerpt_en='Once you accept the quote, the boat is reserved for you.', content_en='If you are happy with the quote, the booking is confirmed. The charter terms, payment plan and cancellation conditions are written clearly in the contract. Once you have read and approved it, the boat will not be given to anyone else on your dates.

Payment terms may vary by boat and season. The details are in your contract.' where slug='onay-sozlesme' and (title_en is null or title_en='');
update public.blog_posts set title_en='Final details and provisioning list', excerpt_en='You share your guest list, route and food preferences.', content_en='After confirmation and before the trip, the following are settled:

- **Guest details:** ID information and number of guests
- **Arrival time:** Your flight or travel times
- **Route and daily plan:** Which coves you''ll visit and how long you''ll stay
- **Food and drink preferences:** What you like and dislike, allergies, vegetarian or vegan menus, and your drink requests

A provisioning list is prepared from this information.' where slug='detaylar-kumanya-listesi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Provisioning', excerpt_en='Food and drinks are loaded onto the boat before the trip.', content_en='Provisioning is one of the most important preparations for the trip. According to the list, food and drinks are bought at the market and loaded onto the boat before you set off.

Practice varies by boat:
- On most boats the captain or cook does the shopping according to your list. The cost is calculated separately and shown to you with receipts.
- You can also bring your own provisions if you wish.
- Anything that runs out during the trip is replenished in the ports and villages you visit.

How provisioning is calculated is settled according to the boat and the contract terms.' where slug='kumanya-alimi' and (title_en is null or title_en='');
update public.blog_posts set title_en='Welcome and briefing', excerpt_en='The captain and crew greet you at the harbour.', content_en='On the day of the trip, the boat waits for you at the harbour or marina. The captain and crew welcome you and help you settle your luggage.

- **Welcome:** The trip starts with a welcome drink and a small treat.
- **Cabins:** Your cabins are shown and you settle in.
- **Boat introduction:** How the boat works, the living areas and the rules are explained.
- **Safety briefing:** You are told about life jackets, fire extinguishers and emergency procedures.
- **Route and daily plan:** The plan for the first days is discussed together with the weather.

This conversation matters so that you can enjoy the rest of the trip with peace of mind.' where slug='karsilama-welcome' and (title_en is null or title_en='');
update public.blog_posts set title_en='Sailing days', excerpt_en='Swimming, sunbathing and anchoring in coves: this is how the days pass.', content_en='A blue voyage day usually goes like this:

- **Morning:** Breakfast and a morning swim
- **Late morning:** Sailing to a new cove
- **Midday:** Anchoring in the cove, swimming and lunch
- **Afternoon:** Rest, water sports, snorkelling or short walks
- **Evening:** Anchoring in a harbour or cove, then dinner

Weather and wind can affect the route. The captain keeps your safety first and changes the route and order when necessary. A flexible plan lets you stay longer in the most beautiful places.' where slug='seyir-gunleri' and (title_en is null or title_en='');
update public.blog_posts set title_en='Return and hand-over', excerpt_en='A last-morning breakfast, a boat check and goodbyes.', content_en='On the last day, the boat returns to the agreed port. You pack your luggage, the general condition of the boat is checked with the captain and any extra costs (fuel, provisioning differences and so on) are calculated.

Hand-over times and extra costs vary by boat; they are written in the contract. If a deposit was taken, it is refunded according to the terms.' where slug='donus-teslim' and (title_en is null or title_en='');
update public.blog_posts set title_en='After the trip', excerpt_en='Your feedback is very valuable to us.', content_en='If you share feedback about your trip once you''re back, you help both us and other guests who will charter later. If you''d like to share your photos, get in touch with us.

We''ll also gladly share our route and boat suggestions for your next trip.' where slug='sonrasi' and (title_en is null or title_en='');
