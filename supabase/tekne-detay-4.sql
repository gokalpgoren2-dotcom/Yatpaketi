-- 4. parti: MedGulets / BoatBookings / 12knots kaynaklı teknik bilgiler. Boş (null) gelen alan mevcut değeri silmez.
update public.boats as b set
  year = coalesce(v.yil, b.year),
  refit_year = coalesce(v.yenileme, b.refit_year),
  crew = coalesce(v.personel, b.crew),
  brand = coalesce(v.marka, b.brand),
  equipment = case when v.ekipman is null then b.equipment else v.ekipman end,
  water_sports = case when v.oyuncak is null then b.water_sports else v.oyuncak end,
  updated_at = now()
from (values
  ('grand-admiral', 2006, null::int, 7, null::text,
    array['Wi-Fi','Klima','Tender','Balık tutma ekipmanı','Şnorkel ekipmanı'],
    array['Paddle board','Kano','Ringo','Su kayağı','Jet ski (ücretli)']),
  ('ubi-bene', 2009, null, 5, null,
    array['Wi-Fi','Klima','Jakuzi','Tender','Balık tutma ekipmanı','Şnorkel ekipmanı'],
    array['Paddle board','Muz (banana) botu','Jet ski','Ringo','Su kayağı','Kano']),
  ('elara-1', 2010, null, 8, null,
    array['Wi-Fi','Klima','Flybridge','Jakuzi'],
    array['Su kayağı','Ringo','Muz (banana) botu','Kano','Şnorkel ekipmanı']),
  ('north-wind', 2023, null, 8, 'Sökmen Kardeşler',
    array['Flybridge','Wi-Fi','Klima','Tender','Balık tutma ekipmanı','Şnorkel ekipmanı'],
    array['Jet ski','Seabob','Wakeboard','Su kayağı','Ringo','Kano','Paddle board']),
  ('dodo', 2005, 2025, 6, null,
    array['Wi-Fi','Klima','Flybridge','Tender','Balık tutma ekipmanı','Şnorkel ekipmanı'],
    array['Jet ski','Wakeboard','Ringo','Paddle board','Su kayağı','Kano']),
  ('boreas', 2010, null, 8, null,
    array['Wi-Fi','Klima','Flybridge','Tender','Balık tutma ekipmanı','Şnorkel ekipmanı'],
    array['Ringo','Paddle board','Su kayağı','Kano']),
  ('mare-nostrum', 2008, null, 6, null,
    array['Wi-Fi','Klima','Tender','Balık tutma ekipmanı','Jakuzi'],
    array['Wakeboard','Su kayağı','Ringo','Paddle board','Jet ski','Kano','Şnorkel ekipmanı']),
  ('vay', 2013, null, null, 'Su Marine', null, null),
  ('halcon-del-mar', 2018, null, null, null, null, null),
  ('admiral', 2013, null, null, null, null, null),
  ('tersane-8', 2012, null, null, null, null, null),
  ('son-of-wind', 2021, null, null, null, null, null),
  ('ocean-breeze', 2009, null, null, null, null, null)
) as v(slug, yil, yenileme, personel, marka, ekipman, oyuncak)
where b.slug = v.slug;
-- Kaynaklar: medgulets.com (ilgili tekne sayfaları), boatbookings.com 40-50 m listesi (Vay, Halcon del Mar, Dodo yenileme, North Wind üretici),
-- 12knots.com (Admiral 2013, Tersane 8 2012, Son of Wind 2021), yachtwarriors.com (Ocean Breeze 2009).
