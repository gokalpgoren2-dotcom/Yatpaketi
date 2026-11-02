-- Queen Atlantis: 20 fotoğrafı ekler, tekneyi yayına alır, öne çıkarır ve ana sayfada 2. sıraya koyar.
-- Supabase > SQL Editor'de bir kez çalıştırın. Tekrar çalıştırmak güvenlidir (aynı fotoğraflar iki kez eklenmez).
-- Fotoğraflar sitenin içinde durur: /tekneler/queen-atlantis/01.jpg ... 20.jpg

do $$
declare
  b uuid;
  i int;
  cur jsonb;
  ord text[];
begin
  select id into b from public.boats where slug = 'queen-atlantis';
  if b is null then
    raise exception 'queen-atlantis adresli tekne bulunamadı';
  end if;

  -- 1) Fotoğraflar: önce eski kapak işaretini kaldır, eski fotoğrafları yeni 20 fotoğrafın arkasına al
  update public.boat_images set is_cover = false, sort_order = sort_order + 100
    where boat_id = b and path not like '/tekneler/queen-atlantis/%';
  for i in 1..20 loop
    if not exists (select 1 from public.boat_images where boat_id = b and path = '/tekneler/queen-atlantis/' || lpad(i::text, 2, '0') || '.jpg') then
      insert into public.boat_images (boat_id, path, alt, is_cover, sort_order)
      values (b, '/tekneler/queen-atlantis/' || lpad(i::text, 2, '0') || '.jpg', 'Queen Atlantis', i = 1, i - 1);
    end if;
  end loop;

  -- 2) Yayına al ve öne çıkar
  update public.boats set is_published = true, is_featured = true where id = b;

  -- 3) Öne çıkanlar sırası: Queen Atlantis 2. sırada
  select data into cur from public.site_texts where key = 'featured';
  if cur is not null and jsonb_typeof(cur->'order') = 'array' and jsonb_array_length(cur->'order') > 0 then
    select array_agg(x order by n) into ord
      from jsonb_array_elements_text(cur->'order') with ordinality as t(x, n) where x <> 'queen-atlantis';
  else
    select array_agg(slug order by sort_order, name) into ord
      from public.boats where is_featured and is_published and slug <> 'queen-atlantis';
  end if;
  ord := coalesce(ord, array[]::text[]);
  if array_length(ord, 1) is null then
    ord := array['queen-atlantis'];
  else
    ord := ord[1:1] || array['queen-atlantis'] || ord[2:];
  end if;
  insert into public.site_texts (key, data, updated_at) values ('featured', jsonb_build_object('order', to_jsonb(ord)), now())
    on conflict (key) do update set data = excluded.data, updated_at = now();
end $$;

-- Kontrol: ilk 5 öne çıkan
select data->'order' as one_cikan_sirasi from public.site_texts where key = 'featured';
