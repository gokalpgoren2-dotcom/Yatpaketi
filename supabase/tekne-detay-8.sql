-- 8. parti: HappyCharter liste sayfalarından yapım yılları. Yalnızca ad VE kabin sayısı eşleşen tekneler.
update public.boats as b set year = v.yil, updated_at = now()
from (values
  ('cobra-king', 2005, 5),
  ('kaptan-kadir', 2004, 6),
  ('orient-star', 2012, 5),
  ('dolce-mare', 2011, 6),
  ('kayhan-11', 2002, 10),
  ('tarsu', 1996, 10),
  ('golden-glory', 1998, 6),
  ('kayhan-8', 2008, 6),
  ('kayhan-5', 2007, 6),
  ('maske-5', 2021, 6),
  ('simi', 2015, 8),
  ('berrak-su', 2008, 6),
  ('diamond-lila', 2007, 6),
  ('oguz-bey', 2014, 8),
  ('vega', 1999, 5),
  ('miss-b', 2009, 4),
  ('queen-of-rtt', 2009, 8)
) as v(slug, yil, kabin)
where b.slug = v.slug and b.cabins = v.kabin;
-- Kaynak: happycharter.com gulet listeleri.
