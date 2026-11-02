-- TURUM: TÜM GÜNCELLEMELER TEK DOSYADA (misafir, KVKK, alışveriş onayı, Excel). Supabase > SQL Editor'de çalıştırın. Tekrar çalıştırmak zararsızdır.

-- ===== turum-misafir.sql =====
-- TURUM: MİSAFİR TERCİHLERİ, MİSAFİR LİSTESİ (TRANSIT LOG), MENÜLER VE ALIŞVERİŞ.
-- Supabase > SQL Editor'de bir kez çalıştırın. Tekrar çalıştırmak zararsızdır.
-- musteri-paneli.sql daha önce çalıştırılmış olmalıdır.

-- 1) Misafir tercihleri (müşteri başına tek kayıt, esnek alanlar)
create table if not exists public.portal_prefs (
  portal_id uuid primary key references public.customer_portals(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Misafir listesi (transit log için)
create table if not exists public.portal_guests (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.customer_portals(id) on delete cascade,
  full_name text not null,
  gender text,
  birth_date date,
  nationality text,
  doc_type text,
  doc_no text,
  phone text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists portal_guests_portal on public.portal_guests (portal_id, sort_order);
alter table public.customer_portals add column if not exists guests_updated_at timestamptz;

-- 3) Menü kütüphanesi (ekip yükler) ve müşterinin seçtikleri
create table if not exists public.portal_menus (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_path text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.portal_menu_choices (
  portal_id uuid not null references public.customer_portals(id) on delete cascade,
  menu_id uuid not null references public.portal_menus(id) on delete cascade,
  note text,
  primary key (portal_id, menu_id)
);

-- 4) Alışveriş listesi / fatura dosyaları (ekip yükler, müşteri görür)
create table if not exists public.portal_files (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.customer_portals(id) on delete cascade,
  kind text not null default 'shopping' check (kind in ('shopping', 'receipt')),
  title text not null,
  note text,
  path text,
  created_at timestamptz not null default now()
);
create index if not exists portal_files_portal on public.portal_files (portal_id, created_at);

alter table public.portal_prefs enable row level security;
alter table public.portal_guests enable row level security;
alter table public.portal_menus enable row level security;
alter table public.portal_menu_choices enable row level security;
alter table public.portal_files enable row level security;

drop policy if exists "admin all" on public.portal_prefs;
create policy "admin all" on public.portal_prefs for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.portal_guests;
create policy "admin all" on public.portal_guests for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.portal_menus;
create policy "admin all" on public.portal_menus for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.portal_menu_choices;
create policy "admin all" on public.portal_menu_choices for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.portal_files;
create policy "admin all" on public.portal_files for all using (public.is_admin()) with check (public.is_admin());

-- Müşteri tarafı: tüm bilgiler tek çağrıda
create or replace function public.portal_extras_get(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token);
begin
  if v_id is null then return null; end if;
  return jsonb_build_object(
    'prefs', coalesce((select data from public.portal_prefs where portal_id = v_id), '{}'::jsonb),
    'guests', coalesce((select jsonb_agg(jsonb_build_object('full_name', g.full_name, 'gender', g.gender, 'birth_date', g.birth_date, 'nationality', g.nationality, 'doc_type', g.doc_type, 'doc_no', g.doc_no, 'phone', g.phone) order by g.sort_order, g.created_at)
                        from public.portal_guests g where g.portal_id = v_id), '[]'::jsonb),
    'menus', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'title', m.title, 'description', m.description, 'file_path', m.file_path,
                        'chosen', exists (select 1 from public.portal_menu_choices c where c.portal_id = v_id and c.menu_id = m.id)) order by m.sort_order, m.title)
                       from public.portal_menus m where m.active), '[]'::jsonb),
    'files', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'kind', f.kind, 'title', f.title, 'note', f.note, 'path', f.path, 'created_at', f.created_at) order by f.created_at desc)
                       from public.portal_files f where f.portal_id = v_id), '[]'::jsonb)
  );
end $$;

create or replace function public.portal_prefs_save(p_token text, p_data jsonb) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token);
begin
  if v_id is null or p_data is null or jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 20000 then return false; end if;
  insert into public.portal_prefs (portal_id, data, updated_at) values (v_id, p_data, now())
  on conflict (portal_id) do update set data = excluded.data, updated_at = now();
  return true;
end $$;

-- Misafir listesinin tamamını yeniler (en çok 40 kişi)
create or replace function public.portal_guests_save(p_token text, p_guests jsonb) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token); g jsonb; i int := 0;
begin
  if v_id is null or p_guests is null or jsonb_typeof(p_guests) <> 'array' or jsonb_array_length(p_guests) > 40 then return false; end if;
  delete from public.portal_guests where portal_id = v_id;
  for g in select * from jsonb_array_elements(p_guests) loop
    if coalesce(trim(g->>'full_name'), '') = '' then continue; end if;
    i := i + 1;
    insert into public.portal_guests (portal_id, full_name, gender, birth_date, nationality, doc_type, doc_no, phone, sort_order)
    values (v_id, left(trim(g->>'full_name'), 120), left(nullif(trim(g->>'gender'), ''), 20),
            case when coalesce(g->>'birth_date', '') ~ '^\d{4}-\d{2}-\d{2}$' then (g->>'birth_date')::date end,
            left(nullif(trim(g->>'nationality'), ''), 60), left(nullif(trim(g->>'doc_type'), ''), 20),
            left(nullif(trim(g->>'doc_no'), ''), 40), left(nullif(trim(g->>'phone'), ''), 30), i);
  end loop;
  update public.customer_portals set guests_updated_at = now() where id = v_id;
  return true;
end $$;

create or replace function public.portal_menus_save(p_token text, p_ids uuid[]) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token);
begin
  if v_id is null then return false; end if;
  delete from public.portal_menu_choices where portal_id = v_id;
  insert into public.portal_menu_choices (portal_id, menu_id)
  select v_id, m.id from public.portal_menus m where m.active and m.id = any(coalesce(p_ids, '{}'::uuid[]));
  return true;
end $$;

-- Dosya okuma izni: yalnızca etkin bir panele bağlı alışveriş dosyaları ve etkin menüler
create or replace function public.portal_file_ok(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.portal_files f join public.customer_portals p on p.id = f.portal_id
                 where f.path = p_name and p.status = 'active' and p.tour_end >= public.portal_today() - 30)
      or exists (select 1 from public.portal_menus m where m.file_path = p_name and m.active)
$$;

grant execute on function public.portal_extras_get(text) to anon, authenticated;
grant execute on function public.portal_prefs_save(text, jsonb) to anon, authenticated;
grant execute on function public.portal_guests_save(text, jsonb) to anon, authenticated;
grant execute on function public.portal_menus_save(text, uuid[]) to anon, authenticated;
grant execute on function public.portal_file_ok(text) to anon, authenticated;

-- Özel dosya deposu (en çok 15 MB; PDF ve fotoğraf)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portal-files', 'portal-files', false, 15728640, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

drop policy if exists "portal files admin all" on storage.objects;
create policy "portal files admin all" on storage.objects for all
  using (bucket_id = 'portal-files' and public.is_admin()) with check (bucket_id = 'portal-files' and public.is_admin());
drop policy if exists "portal files read" on storage.objects;
create policy "portal files read" on storage.objects for select
  using (bucket_id = 'portal-files' and public.portal_file_ok(name));

-- ===== turum-kvkk.sql =====
-- TURUM: KVKK ONAYLARI. Supabase > SQL Editor'de bir kez çalıştırın (turum-misafir.sql'den sonra).
-- Misafir listesi için aydınlatma metni onayı ve sağlık bilgileri (alerji, kronik hastalık) için açık rıza kaydı.

alter table public.customer_portals add column if not exists kvkk_info_at timestamptz;
alter table public.customer_portals add column if not exists kvkk_health_at timestamptz;

-- Onayı kaydeder: p_kind = 'info' (aydınlatma metni) veya 'health' (sağlık verisi açık rızası)
create or replace function public.portal_kvkk(p_token text, p_kind text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token);
begin
  if v_id is null then return false; end if;
  if p_kind = 'info' then update public.customer_portals set kvkk_info_at = now() where id = v_id;
  elsif p_kind = 'health' then update public.customer_portals set kvkk_health_at = now() where id = v_id;
  else return false; end if;
  return true;
end $$;

-- Misafir listesi yalnızca aydınlatma metni onaylandıysa kaydedilir
create or replace function public.portal_guests_save(p_token text, p_guests jsonb) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token); g jsonb; i int := 0;
begin
  if v_id is null or p_guests is null or jsonb_typeof(p_guests) <> 'array' or jsonb_array_length(p_guests) > 40 then return false; end if;
  if not exists (select 1 from public.customer_portals where id = v_id and kvkk_info_at is not null) then return false; end if;
  delete from public.portal_guests where portal_id = v_id;
  for g in select * from jsonb_array_elements(p_guests) loop
    if coalesce(trim(g->>'full_name'), '') = '' then continue; end if;
    i := i + 1;
    insert into public.portal_guests (portal_id, full_name, gender, birth_date, nationality, doc_type, doc_no, phone, sort_order)
    values (v_id, left(trim(g->>'full_name'), 120), left(nullif(trim(g->>'gender'), ''), 20),
            case when coalesce(g->>'birth_date', '') ~ '^\d{4}-\d{2}-\d{2}$' then (g->>'birth_date')::date end,
            left(nullif(trim(g->>'nationality'), ''), 60), left(nullif(trim(g->>'doc_type'), ''), 20),
            left(nullif(trim(g->>'doc_no'), ''), 40), left(nullif(trim(g->>'phone'), ''), 30), i);
  end loop;
  update public.customer_portals set guests_updated_at = now() where id = v_id;
  return true;
end $$;

-- Sağlık bilgisi içeren tercihler yalnızca açık rıza verildiyse kaydedilir
create or replace function public.portal_prefs_save(p_token text, p_data jsonb) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token);
begin
  if v_id is null or p_data is null or jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 20000 then return false; end if;
  if (coalesce((p_data #>> '{allergy,has}')::boolean, false) or coalesce((p_data #>> '{chronic,has}')::boolean, false))
     and not exists (select 1 from public.customer_portals where id = v_id and kvkk_health_at is not null) then return false; end if;
  insert into public.portal_prefs (portal_id, data, updated_at) values (v_id, p_data, now())
  on conflict (portal_id) do update set data = excluded.data, updated_at = now();
  return true;
end $$;

create or replace function public.portal_extras_get(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token); r record;
begin
  if v_id is null then return null; end if;
  select kvkk_info_at, kvkk_health_at into r from public.customer_portals where id = v_id;
  return jsonb_build_object(
    'kvkk_info_at', r.kvkk_info_at, 'kvkk_health_at', r.kvkk_health_at,
    'prefs', coalesce((select data from public.portal_prefs where portal_id = v_id), '{}'::jsonb),
    'guests', coalesce((select jsonb_agg(jsonb_build_object('full_name', g.full_name, 'gender', g.gender, 'birth_date', g.birth_date, 'nationality', g.nationality, 'doc_type', g.doc_type, 'doc_no', g.doc_no, 'phone', g.phone) order by g.sort_order, g.created_at)
                        from public.portal_guests g where g.portal_id = v_id), '[]'::jsonb),
    'menus', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'title', m.title, 'description', m.description, 'file_path', m.file_path,
                        'chosen', exists (select 1 from public.portal_menu_choices c where c.portal_id = v_id and c.menu_id = m.id)) order by m.sort_order, m.title)
                       from public.portal_menus m where m.active), '[]'::jsonb),
    'files', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'kind', f.kind, 'title', f.title, 'note', f.note, 'path', f.path, 'created_at', f.created_at) order by f.created_at desc)
                       from public.portal_files f where f.portal_id = v_id), '[]'::jsonb)
  );
end $$;

grant execute on function public.portal_kvkk(text, text) to anon, authenticated;

-- ===== turum-alisveris.sql =====
-- TURUM: ALIŞVERİŞ LİSTESİ ONAYI. Supabase > SQL Editor'de bir kez çalıştırın (turum-misafir.sql'den sonra).
-- Ekip alışveriş listesini yükler; misafir onaylar ya da değişiklik ister.

alter table public.portal_files add column if not exists approved_at timestamptz;
alter table public.portal_files add column if not exists customer_note text;
alter table public.portal_files add column if not exists change_requested_at timestamptz;

-- p_ok = true: onay; false: değişiklik isteği (p_note ile)
create or replace function public.portal_file_answer(p_token text, p_id uuid, p_ok boolean, p_note text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token);
begin
  if v_id is null then return false; end if;
  if not exists (select 1 from public.portal_files where id = p_id and portal_id = v_id) then return false; end if;
  if p_ok then
    update public.portal_files set approved_at = now(), change_requested_at = null, customer_note = nullif(left(trim(coalesce(p_note, '')), 2000), '') where id = p_id;
  else
    if coalesce(trim(p_note), '') = '' then return false; end if;
    update public.portal_files set approved_at = null, change_requested_at = now(), customer_note = left(trim(p_note), 2000) where id = p_id;
  end if;
  return true;
end $$;
grant execute on function public.portal_file_answer(text, uuid, boolean, text) to anon, authenticated;

create or replace function public.portal_extras_get(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token); r record;
begin
  if v_id is null then return null; end if;
  select kvkk_info_at, kvkk_health_at into r from public.customer_portals where id = v_id;
  return jsonb_build_object(
    'kvkk_info_at', r.kvkk_info_at, 'kvkk_health_at', r.kvkk_health_at,
    'prefs', coalesce((select data from public.portal_prefs where portal_id = v_id), '{}'::jsonb),
    'guests', coalesce((select jsonb_agg(jsonb_build_object('full_name', g.full_name, 'gender', g.gender, 'birth_date', g.birth_date, 'nationality', g.nationality, 'doc_type', g.doc_type, 'doc_no', g.doc_no, 'phone', g.phone) order by g.sort_order, g.created_at)
                        from public.portal_guests g where g.portal_id = v_id), '[]'::jsonb),
    'menus', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'title', m.title, 'description', m.description, 'file_path', m.file_path,
                        'chosen', exists (select 1 from public.portal_menu_choices c where c.portal_id = v_id and c.menu_id = m.id)) order by m.sort_order, m.title)
                       from public.portal_menus m where m.active), '[]'::jsonb),
    'files', coalesce((select jsonb_agg(jsonb_build_object('id', f.id, 'kind', f.kind, 'title', f.title, 'note', f.note, 'path', f.path, 'created_at', f.created_at,
                        'approved_at', f.approved_at, 'change_requested_at', f.change_requested_at, 'customer_note', f.customer_note) order by f.created_at desc)
                       from public.portal_files f where f.portal_id = v_id), '[]'::jsonb)
  );
end $$;

-- ===== turum-excel.sql =====
-- TURUM: ALIŞVERİŞ LİSTESİ İÇİN EXCEL İZNİ. Supabase > SQL Editor'de bir kez çalıştırın.
update storage.buckets
set allowed_mime_types = array[
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'
]
where id = 'portal-files';
