-- Tekne tipleri: Motoryat, Gulet, Yelkenli - Katamaran, Luks Yat
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir.
-- DIKKAT: Trawler ve Gunluk Tekneler tipindeki tekneler tipsiz kalir;
-- admin panelde Tekneler'den tiplerini secin. Katamaran tipindeki tekneler Yelkenli - Katamaran'a tasinir.
update public.boats set category_id = (select id from public.categories where slug='yelkenli')
  where category_id = (select id from public.categories where slug='katamaran');

insert into public.categories (slug, name_tr, name_en, sort_order) values
  ('motoryat','Motoryat','Motor Yacht',1), ('gulet','Gulet','Gulet',2),
  ('yelkenli','Yelkenli - Katamaran','Sailing Yacht - Catamaran',3), ('luks-yat','Lüks Yat','Luxury Yacht',4)
on conflict (slug) do update set name_tr = excluded.name_tr, name_en = excluded.name_en, sort_order = excluded.sort_order, is_active = true;

delete from public.categories where slug not in ('motoryat','gulet','yelkenli','luks-yat');
