-- 3. parti: MedGulets kaynaklı teknik bilgiler (yalnızca olgu bilgisi). Tekrar çalıştırmak güvenlidir.
update public.boats as b set
  year = v.yil, crew = v.personel, equipment = v.ekipman, water_sports = v.oyuncak, updated_at = now()
from (values
  ('carpediem-5', 2012, 7,
    array['Wi-Fi','Klima','Tender'],
    array['Jet ski','Wakeboard','Ringo','Paddle board','Su kayağı','Kano','Balık tutma ekipmanı','Şnorkel ekipmanı']),
  ('la-bella-vita', 2010, 6,
    array['Wi-Fi','Klima','Tender'],
    array['Seabob','Jet ski','Wakeboard','Ringo','Paddle board','Su kayağı','Kano','Balık tutma ekipmanı','Şnorkel ekipmanı']),
  ('de-love', 2024, 8,
    array['Wi-Fi','Klima','Flybridge','Jakuzi','Tender'],
    array['Paddle board','Seabob','Kano','Wakeboard','Su kayağı','Jet ski']),
  ('infinity', 2011, 7,
    array['Wi-Fi','Klima','Flybridge'],
    array['Jet ski','Seabob','Wakeboard','Su kayağı','Kneeboard','Muz (banana) botu','Ringo','Paddle board','Kano','Balık tutma ekipmanı','Şnorkel ekipmanı']),
  ('king-of-the-sea', 2024, 9,
    array['Wi-Fi','Klima','Flybridge','Jakuzi','Tender'],
    array['Şnorkel ekipmanı','Balık tutma ekipmanı','Paddle board','Kano','Su kayağı','Wakeboard','Jet ski'])
) as v(slug, yil, personel, ekipman, oyuncak)
where b.slug = v.slug;
-- Kaynak: medgulets.com/yacht-charter/turkey/high-luxury/<tekne> sayfaları.
-- Not: boy/kapasite listedekiyle farklı olanlara (La Bella Vita 45 m, De Love 50 m) dokunulmadı.
