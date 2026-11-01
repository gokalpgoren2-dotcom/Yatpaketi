-- 6. parti: BoatBookings liste sayfasından yapım/yenileme yılları (yalnızca kabin sayısı da eşleşen tekneler).
update public.boats as b set
  year = v.yil,
  refit_year = coalesce(v.yenileme, b.refit_year),
  updated_at = now()
from (values
  ('questa-vita', 2021, 2024, 6),
  ('bedia-sultan', 2008, 2023, 5),
  ('bella-mare', 2005, 2023, 6),
  ('caner-4', 2008, null::int, 6),
  ('lady-freya', 2008, null, 4),
  ('mein-schatz', 2005, 2013, 5),
  ('dreamland', 2006, null, 6),
  ('serenity-86', 2007, null, 4),
  ('kaftan', 1998, 2022, 4),
  ('escape', 1994, 2022, 6),
  ('dea-del-mare', 2009, 2019, 5),
  ('serenad', 2003, null, 6),
  ('diva-deniz', 2008, null, 6),
  ('blue-heaven', 2011, null, 5),
  ('nurten-a', 2002, 2006, 6)
) as v(slug, yil, yenileme, kabin)
where b.slug = v.slug and b.cabins = v.kabin;
-- Kaynak: boatbookings.com/yacht_charter/gulet_blue_cruise_turkey_charter.php
-- Kabin/kapasite uyuşmayan (Gora, Getaway, Estrella de Mar) atlandı.
