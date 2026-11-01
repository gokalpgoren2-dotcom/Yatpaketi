-- Tekne tipleri: yalnizca Motoryat, Gulet, Yelkenli, Luks Yat
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir.
-- DIKKAT: Katamaran, Trawler ve Gunluk Tekneler tipindeki tekneler tipsiz kalir;
-- admin panelde Tekneler'den tiplerini secin.
insert into public.categories (slug, name_tr, name_en, sort_order) values
  ('motoryat','Motoryat','Motor Yacht',1), ('gulet','Gulet','Gulet',2),
  ('yelkenli','Yelkenli','Sailing Yacht',3), ('luks-yat','Lüks Yat','Luxury Yacht',4)
on conflict (slug) do update set sort_order = excluded.sort_order, is_active = true;

delete from public.categories where slug not in ('motoryat','gulet','yelkenli','luks-yat');
