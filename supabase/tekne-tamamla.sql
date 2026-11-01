-- Tekne bilgilerini tamamlar (maviyolculuk.org liste sayfalarından; yalnızca sizin listenizdeki teknelerin BOŞ alanları).
-- Dolu alanlara dokunmaz. Supabase > SQL Editor'de çalıştırın; tekrar çalıştırmak güvenlidir.

update public.boats b set
  length_m = coalesce(b.length_m, v.boy::numeric),
  cabins = case when b.cabins = 0 then v.kabin::int else b.cabins end,
  guests = case when b.guests <= 1 then v.kap::int else b.guests end,
  home_port = coalesce(b.home_port, v.liman)
from (values
  ('cakir-mehmet', 22, 6, 12, 'Bozburun'),
  ('suleyman-bey', 25, 6, 12, 'Fethiye'),
  ('bogac-kaptan', 15, 2, 4, 'Fethiye'),
  ('kaptan-melih', 16, 3, 6, 'Bozburun'),
  ('ceylan', 20, 3, 6, 'Fethiye')
) as v(slug, boy, kabin, kap, liman) where b.slug = v.slug;
