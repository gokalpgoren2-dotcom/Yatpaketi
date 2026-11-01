-- Haritada görünecek yeni destinasyonlar: Kaş - Kekova, Bozburun, Datça. Daha önce eklenmişse dokunmaz.
insert into public.destinations (slug, name_tr, name_en, blurb_tr, blurb_en, intro_tr, intro_en, sort_order, is_published) values
  ('kas-kekova', 'Kaş - Kekova', 'Kas - Kekova', 'Berrak koylar, batık şehir ve dalış rotaları', 'Clear coves, the sunken city and diving routes',
   'Kaş - Kekova rotaları Meis Adası, Kalkan, batık antik kent, Üçağız ve Kaleköy çevresindeki berrak ve sakin koylara uzanır.',
   'Kaş - Kekova routes reach the clear, calm coves around the island of Meis, Kalkan, the sunken ancient city, Üçağız and Kaleköy.', 6, true),
  ('bozburun', 'Bozburun', 'Bozburun', 'Gulet kenti Bozburun ve Sömbeki', 'Bozburun, the gulet town, and Sömbeki',
   'Bozburun Yarımadası, geleneksel gulet yapımı ve sakin koylarıyla Marmaris ile Datça arasındaki rotaların uğrak noktasıdır.',
   'The Bozburun Peninsula, known for traditional gulet building and quiet bays, is a favourite stop between Marmaris and Datça.', 8, true)
  , ('datca-hisaronu-korfezi', 'Datça - Hisarönü Körfezi', 'Datça - Hisarönü Bay', 'Datça Yarımadası, Knidos ve Hisarönü koyları', 'The Datça Peninsula, Knidos and the Hisarönü bays',
   'Datça - Hisarönü Körfezi rotaları Datça Yarımadası, Knidos, Bozburun ve Hisarönü koylarında Ege ile Akdeniz''in buluştuğu sakin sulara uzanır.',
   'Datça - Hisarönü Bay routes reach the calm waters where the Aegean meets the Mediterranean, around the Datça Peninsula, Knidos, Bozburun and the Hisarönü bays.', 9, true)
on conflict (slug) do nothing;

-- Daha önce Kaş ve Kekova ayrı eklendiyse tek destinasyonda birleştirir.
update public.destinations set slug = 'kas-kekova', name_tr = 'Kaş - Kekova', name_en = 'Kas - Kekova',
  blurb_tr = 'Berrak koylar, batık şehir ve dalış rotaları', blurb_en = 'Clear coves, the sunken city and diving routes',
  intro_tr = 'Kaş - Kekova rotaları Meis Adası, Kalkan, batık antik kent, Üçağız ve Kaleköy çevresindeki berrak ve sakin koylara uzanır.',
  intro_en = 'Kaş - Kekova routes reach the clear, calm coves around the island of Meis, Kalkan, the sunken ancient city, Üçağız and Kaleköy.'
where slug = 'kas' and not exists (select 1 from public.destinations where slug = 'kas-kekova');
delete from public.destinations where slug = 'kekova';

-- Daha önce Datça olarak eklendiyse adını Datça - Hisarönü Körfezi yapar.
update public.destinations set slug = 'datca-hisaronu-korfezi', name_tr = 'Datça - Hisarönü Körfezi', name_en = 'Datça - Hisarönü Bay',
  blurb_tr = 'Datça Yarımadası, Knidos ve Hisarönü koyları', blurb_en = 'The Datça Peninsula, Knidos and the Hisarönü bays',
  intro_tr = 'Datça - Hisarönü Körfezi rotaları Datça Yarımadası, Knidos, Bozburun ve Hisarönü koylarında Ege ile Akdeniz''in buluştuğu sakin sulara uzanır.',
  intro_en = 'Datça - Hisarönü Bay routes reach the calm waters where the Aegean meets the Mediterranean, around the Datça Peninsula, Knidos, Bozburun and the Hisarönü bays.'
where slug = 'datca' and not exists (select 1 from public.destinations where slug = 'datca-hisaronu-korfezi');

-- Antalya tüm destinasyonlardan kaldırılır (bağlı teknelerin yalnızca bu destinasyon bağlantısı silinir, tekneler kalır).
delete from public.destinations where slug = 'antalya';
