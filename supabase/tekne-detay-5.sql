-- 5. parti: MedGulets kaynaklı teknik bilgiler. Boş (null) gelen alan mevcut değeri silmez.
update public.boats as b set
  year = coalesce(v.yil, b.year),
  crew = coalesce(v.personel, b.crew),
  equipment = case when v.ekipman is null then b.equipment else v.ekipman end,
  water_sports = case when v.oyuncak is null then b.water_sports else v.oyuncak end,
  updated_at = now()
from (values
  ('perla-del-mare', 2010, 8,
    array['Wi-Fi','Klima','Jakuzi','Tender','Şnorkel ekipmanı'],
    array['Jet ski','Wakeboard','Su kayağı','Kneeboard','Kano']),
  ('esma-sultan', 2008, 7,
    array['Wi-Fi','Klima','Flybridge','Jakuzi','Tender','Şnorkel ekipmanı','Balık tutma ekipmanı'],
    array['Jet ski','Wakeboard','Su kayağı','Rüzgar sörfü','Kneeboard','Muz (banana) botu','Ringo','Paddle board','Kano']),
  ('hic-salta', 2006, 6,
    array['Wi-Fi','Klima'],
    array['Şnorkel ekipmanı','Balık tutma ekipmanı','Wakeboard','Ringo','Paddle board','Muz (banana) botu','Su kayağı','Jet ski']),
  ('moss', 2016, 6,
    array['Wi-Fi','Klima','Tender'],
    array['Wakeboard','Ringo','Kano','Su kayağı']),
  ('clear-eyes', 2010, 9,
    array['Wi-Fi','Klima','Jakuzi','Tender','Şnorkel ekipmanı','Balık tutma ekipmanı'],
    array['Monoski','Şişme kaydırak','Kneeboard','Seabob','Jet ski','Wakeboard','Ringo','Paddle board','Su kayağı','Kano']),
  ('babylon', null, 6,
    array['Wi-Fi','Klima','Tender','Balık tutma ekipmanı','Şnorkel ekipmanı'],
    array['Kneeboard','Wakeboard','Ringo','Paddle board','Su kayağı','Kano']),
  ('caustic', 2007, 6,
    array['Flybridge','Wi-Fi','Klima','Tender','Balık tutma ekipmanı','Şnorkel ekipmanı'],
    array['Jet ski','Seabob','Yüzen platform','Rüzgar sörfü','Ringo','Paddle board','Su kayağı','Kano'])
) as v(slug, yil, personel, ekipman, oyuncak)
where b.slug = v.slug;
-- Kaynak: medgulets.com tekne sayfaları. Babylon'un yapım yılı kaynaklar arasında çelişiyor (2014/2015/2022), yazılmadı.
