-- İngilizce site için tekne tipi ve destinasyon adları. Boş (null) olanları doldurur; dolu olanlara dokunmaz.
update public.categories as c set name_en = v.en
from (values
  ('Gulet','Gulet'),('Motoryat','Motor Yacht'),('Katamaran','Catamaran'),('Yelkenli','Sailing Yacht'),
  ('Trawler','Trawler'),('Lüks Yat','Luxury Yacht'),('Günlük Tekneler','Day Boats')
) as v(tr, en)
where c.name_tr = v.tr and (c.name_en is null or c.name_en = '');

update public.destinations as d set
  name_en = coalesce(nullif(d.name_en, ''), d.name_tr),
  blurb_en = coalesce(nullif(d.blurb_en, ''), v.blurb),
  intro_en = coalesce(nullif(d.intro_en, ''), v.intro)
from (values
  ('gocek', '12 Islands and calm coves', 'Göcek is one of the best-known departure points for the blue voyage, with sheltered bays and the 12 Islands route.'),
  ('bodrum', 'Nightlife and the Aegean breeze', 'Routes from Bodrum reach Datça, Gökova and the Greek islands.'),
  ('fethiye', 'Ölüdeniz and Butterfly Valley', 'Fethiye suits both day and weekly routes, with Ölüdeniz and the surrounding bays.'),
  ('marmaris', 'Orhaniye and Hisarönü bays', 'Marmaris is the starting point for Orhaniye, Hisarönü bays and the Datça Peninsula routes.'),
  ('antalya', 'Kekova and the turquoise Mediterranean', 'Routes from Antalya cover Kekova and the clear waters of the Mediterranean coast.')
) as v(slug, blurb, intro)
where d.slug = v.slug;
