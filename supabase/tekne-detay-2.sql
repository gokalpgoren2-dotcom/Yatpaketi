-- 2. parti: büyük teknelerin teknik bilgileri (açık charter sitelerinden, yalnızca olgu bilgisi).
-- Yalnızca ilgili slug satırlarını günceller; tekrar çalıştırmak güvenlidir.
update public.boats as b set
  year = v.yil, refit_year = v.yenileme, width_m = v.genislik, crew = v.personel, brand = v.marka,
  equipment = v.ekipman, water_sports = v.oyuncak, updated_at = now()
from (values
  ('all-about-you-2', 2019, null, null::numeric, 10, null,
    array['Wi-Fi','Klima','Flybridge','Tender'],
    array['Şnorkel ekipmanı','Paddle board','Seabob','Muz (banana) botu','Şişme kaydırak','Jet ski','Wakeboard','Su kayağı','Ringo','Kano','Balık tutma ekipmanı']),
  ('meira', 2018, null, null, 10, null,
    array['Wi-Fi','Klima','Flybridge','Sauna','Jakuzi'],
    array['Seabob','Jet ski','Su kayağı','Wakeboard','Ringo','Paddle board','Kano','Su kaydırağı','Şnorkel ekipmanı','Balık tutma ekipmanı']),
  ('legasea', 2025, null, 8.8::numeric, 10, 'ADA Yacht',
    array['Klima','Güverte duşu','Salon müzik sistemi','Havuzlu plaj kulübü (hidrolik kanatlı)','Baş güverte jakuzisi','Ana güvertede jakuzili ve balkonlu sahip suiti','14 m refakat teknesi','Tender (Highfield 560)'],
    array['Jet ski','Seabob','Elektrikli lift foil','Ringo (3 adet)','Paddle board (4 adet)','Kano (2 kişilik)','Şnorkel ekipmanı','Wakeboard','Su kayağı','Yüzen minderler','Tüp (tube)']),
  ('sallyna', 2023, null, null, 8, 'Su Marine',
    array['Wi-Fi','Klima','Tender'],
    array['Yüzen yüzme platformu','Muz (banana) botu','Su kayağı','Kano','Paddle board','Wakeboard','Seabob','Jet ski']),
  ('vetro', 2012, 2020, 7.4::numeric, 6, null,
    array['Klima (her kabinde)','Wi-Fi (Türk karasularında)','Amerikan bar','Salonda LCD TV ve müzik sistemi','2 x 1450 HP motor','Seyir cihazları'],
    array['Su kayağı (opsiyonel)','Jet ski (opsiyonel)']),
  ('alkonost', 2007, null, 8.3::numeric, 0, null,
    array['Klima','Jeneratör','Su yapıcı','Elektrikli vinç'],
    array['Kano','Paddle board','Wakeboard','Wakesurf','Genaker yelkeni','Balık tutma olta takımı','Şnorkel ekipmanı','Jet ski (opsiyonel)','Su kayağı (opsiyonel)'])
) as v(slug, yil, yenileme, genislik, personel, marka, ekipman, oyuncak)
where b.slug = v.slug;
-- Kaynaklar: medgulets.com (all-about-u-2, meira, sallyna), yachtwarriors.com (legasea; 29 ft ≈ 8,8 m),
-- barbarosyachting.com (Vetro; 7,35 m), 12knots.com (Alkonost; 8,25 m), yatco.com (Sallyna: Su Marine).
