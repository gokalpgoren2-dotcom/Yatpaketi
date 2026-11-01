-- Haritada görünecek yeni destinasyonlar: Kaş, Kekova, Bozburun. Daha önce eklenmişse dokunmaz.
insert into public.destinations (slug, name_tr, name_en, blurb_tr, blurb_en, intro_tr, intro_en, sort_order, is_published) values
  ('kas', 'Kaş', 'Kas', 'Kaş''ın berrak koyları ve dalış rotaları', 'Clear coves and diving routes of Kaş',
   'Kaş çıkışlı rotalar Kekova, Kalkan ve Meis Adası çevresindeki berrak koylara uzanır.',
   'Routes from Kaş reach the clear coves around Kekova, Kalkan and the island of Meis.', 6, true),
  ('kekova', 'Kekova', 'Kekova', 'Batık şehir ve sakin koylar', 'The sunken city and calm coves',
   'Kekova, batık antik kenti, Üçağız ve Kaleköy ile mavi yolculuğun en sakin rotalarından biridir.',
   'Kekova, with its sunken ancient city, Üçağız and Kaleköy, is one of the calmest blue voyage routes.', 7, true),
  ('bozburun', 'Bozburun', 'Bozburun', 'Gulet kenti Bozburun ve Sömbeki', 'Bozburun, the gulet town, and Sömbeki',
   'Bozburun Yarımadası, geleneksel gulet yapımı ve sakin koylarıyla Marmaris ile Datça arasındaki rotaların uğrak noktasıdır.',
   'The Bozburun Peninsula, known for traditional gulet building and quiet bays, is a favourite stop between Marmaris and Datça.', 8, true)
on conflict (slug) do nothing;
