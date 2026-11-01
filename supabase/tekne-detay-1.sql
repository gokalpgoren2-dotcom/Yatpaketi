-- 1. parti: en büyük teknelerin teknik bilgileri (açık charter sitelerinden, yalnızca olgu bilgisi).
-- Kaynaklar dosya sonunda. Yalnızca ilgili tekne satırlarını günceller; tekrar çalıştırmak güvenlidir.
-- Not: Listede bulunmayan tekneye (slug eşleşmezse) dokunmaz.

update public.boats as b set
  year = v.yil, refit_year = v.yenileme, width_m = v.genislik, crew = v.personel, brand = v.marka,
  equipment = v.ekipman, water_sports = v.oyuncak, updated_at = now()
from (values
  ('queen-mare', 2012, 2025, 10.0::numeric, 12, 'Alpha',
    array['Sıfır hız stabilizatörleri','Fitness salonu','İsveç saunası (duşlu)','Jakuzi / havuz','Kıç yüzme platformu','Kapalı bar','Garaj'],
    array[]::text[]),
  ('bahriyeli-c', 2005, null, null, 6, null,
    array['Wi-Fi','Klima','Flybridge','Tender'],
    array['Paddle board','Kano (1 tek, 1 çift kişilik)','Şnorkel ekipmanı']),
  ('yazz', 2007, 2023, null, 13, 'Aegean Yacht',
    array['Jakuzi','Tam klima','Güneş tentesi','Güverte duşu','Wi-Fi','Buz makinesi','Eğlence sistemi'],
    array['Jet ski','Seabob','Paddle board','Wakeboard','Su kayağı','Ringo (2 adet)','Pedalo','Şnorkel ekipmanı']),
  ('burkut', 2009, null, 10.2::numeric, 13, 'Baglietto',
    array['Çelik gövde, alüminyum üst yapı','Tik güverte','Çift pervane'],
    array[]::text[]),
  ('halas-71', 1914, null, null, 15, null,
    array['Wi-Fi','Klima','Flybridge','Tender'],
    array['Seabob','Paddle board','Ringo','Kneeboard','Wakeboard','Su kayağı','Kano','Yüzen yüzme platformu']),
  ('aresteas', 2017, null, 10.28::numeric, 10, null,
    array['Jakuzi','Tam klima','Güverte duşu','Wi-Fi','Buz makinesi','Su yapıcı','Eğlence sistemi','Sinema','Fitness ve masaj odası','Kızılötesi tuz sauna','Asansör'],
    array['Jet ski (2 adet)','Seabob (2 adet)','Deniz kayağı (2 adet)','Paddle board (2 adet)','Wakeboard (2 adet)','Su kayağı (2 adet)','Şişme eğlence oyuncakları','Kaydırak','Trambolin','Deniz havuzu','Balık tutma ekipmanı','Şnorkel ekipmanı']),
  ('oguz-khan', 2025, null, 9.83::numeric, 7, 'Bodrum Oğuz Marin',
    array['Jakuzi','Türk hamamı ve buhar odası (ana suit)'],
    array[]::text[])
) as v(slug, yil, yenileme, genislik, personel, marka, ekipman, oyuncak)
where b.slug = v.slug;

-- Kaynaklar (erişim: Kasım 2026):
-- Queen Mare: worthavenueyachts.com/charter-yachts/queen-mare
-- Bahriyeli C: medgulets.com/gulet-charter/turkey/marmaris/bahriyeli-c
-- Yazz: boatbookings.com (pid163190)
-- Burkut: superyachts.com/fleet/burkut-4204
-- Halas 71: medgulets.com/yacht-charter/turkey/high-luxury/halas-71
-- Aresteas: boatbookings.com (pid162056)
-- Oguz Khan: iyc.com/yachts/oguz-khan
