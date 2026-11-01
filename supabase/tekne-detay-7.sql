-- 7. parti: BoatBookings/HappyCharter liste sayfalarından yapım yılı, yenileme yılı ve (adı geçiyorsa) üretici.
-- Yalnızca ad VE kabin sayısı eşleşen tekneler güncellenir; boş değer mevcut bilgiyi silmez.
update public.boats as b set
  year = v.yil,
  refit_year = coalesce(v.yenileme, b.refit_year),
  brand = coalesce(v.marka, b.brand),
  updated_at = now()
from (values
  ('calm-down', 2023, null, 6, null),
  ('funda-d', 2007, 2019, 5, 'Ferretti'),
  ('go', 2009, 2022, 5, 'Dragos Yachts'),
  ('queen-of-makri', 2021, null, 6, null),
  ('quest-r', 2008, 2018, 5, 'Benetti'),
  ('blues', 1997, 2023, 5, 'Ses Marine'),
  ('axella', 1992, 2022, 5, 'Eurocraft'),
  ('deep-water', 2022, null, 6, null),
  ('belgin-sultan', 2024, null, 5, null),
  ('lavin', 2024, null, 4, null),
  ('princess-melda', 2022, null, 6, 'Neta Marine'),
  ('floki', 2021, null, 4, null),
  ('nevra-queen', 2019, 2024, 10, 'Bodrum Shipyards'),
  ('bella-luna', 2016, 2026, 4, 'Monte Carlo'),
  ('fx', 2016, null, 5, 'Peri'),
  ('archsea', 2014, null, 4, 'HG Yachting'),
  ('hasay', 2005, null, 4, null),
  ('babacan', 2022, null, 6, null),
  ('ok-ay', 2023, null, 3, null),
  ('arabella', 2007, null, 4, null),
  ('simi', 2015, null, 8, null),
  ('kayhan-5', 2007, null, 6, null),
  ('berrak-su', 2008, null, 6, null),
  ('vega', 1999, null, 5, null),
  ('diamond-lila', 2007, null, 6, null),
  ('oguz-bey', 2014, null, 8, null),
  ('simerenya', 2003, null, 8, null),
  ('kaptan-mehmet-bugra', 2014, null, 8, null),
  ('prenses-lila', 2003, null, 8, null),
  ('ugur-2005', 2005, null, 7, null),
  ('remzi-yilmaz', 2012, null, 6, null),
  ('long-island', 2019, 2022, 5, 'Fethiye Shipyard')
) as v(slug, yil, yenileme, kabin, marka)
where b.slug = v.slug and b.cabins = v.kabin;
-- Kaynaklar: boatbookings.com (Bodrum, Marmaris, Göcek, mavi yolculuk listeleri), happycharter.com gulet listeleri.
