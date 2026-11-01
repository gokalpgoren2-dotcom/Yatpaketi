-- MÜŞTERİ YORUMLARI. Supabase > SQL Editor'de bir kez çalıştırın (tekrar çalıştırmak güvenlidir).
-- Yorumlar önce "bekliyor" durumunda gelir; siz onaylayınca sitede görünür.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  boat_slug text,
  boat_name text not null default '',
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  photo_path text,
  tour_label text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  source text not null default 'customer' check (source in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.review_requests (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  portal_id uuid references public.customer_portals(id) on delete set null,
  email text not null,
  customer_name text,
  boat_slug text,
  boat_name text not null default '',
  tour_end date,
  expires_at timestamptz not null,
  used boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.review_slots (
  path text primary key,
  request_id uuid not null references public.review_requests(id) on delete cascade,
  expires_at timestamptz not null,
  used boolean not null default false
);

alter table public.reviews enable row level security;
alter table public.review_requests enable row level security;
alter table public.review_slots enable row level security;

drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews for select using (status = 'approved');
drop policy if exists "admin all reviews" on public.reviews;
create policy "admin all reviews" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all review_requests" on public.review_requests;
create policy "admin all review_requests" on public.review_requests for all using (public.is_admin()) with check (public.is_admin());
-- review_slots için politika yok: yalnızca aşağıdaki güvenli fonksiyonlar erişir.

-- Yönetici: müşteriye gidecek tek kullanımlık yorum bağlantısı üretir (45 gün geçerli).
create or replace function public.admin_create_review_request(p_email text, p_name text, p_boat_slug text, p_boat_name text, p_tour_end date, p_portal_id uuid)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare v_token text := encode(gen_random_bytes(24), 'hex');
begin
  if not public.is_admin() then raise exception 'yetkisiz'; end if;
  insert into public.review_requests (token_hash, portal_id, email, customer_name, boat_slug, boat_name, tour_end, expires_at, sent_at)
  values (encode(digest(v_token, 'sha256'), 'hex'), p_portal_id, lower(trim(p_email)), nullif(trim(p_name), ''), nullif(trim(p_boat_slug), ''), coalesce(trim(p_boat_name), ''), p_tour_end, now() + interval '45 days', now());
  return v_token;
end $$;

create or replace function public.review_request_get(p_token text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r record;
begin
  select * into r from public.review_requests where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  if not found then return null; end if;
  return jsonb_build_object('boat_name', r.boat_name, 'customer_name', r.customer_name, 'used', r.used, 'expired', r.expires_at < now());
end $$;

create or replace function public.review_upload_slot(p_token text, p_ext text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare r record; v_path text;
begin
  select * into r from public.review_requests where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex') and not used and expires_at > now();
  if not found then return null; end if;
  if lower(coalesce(p_ext, '')) <> 'jpg' then return null; end if;
  delete from public.review_slots where expires_at < now() and not used;
  v_path := 'r/' || gen_random_uuid()::text || '.jpg';
  insert into public.review_slots (path, request_id, expires_at) values (v_path, r.id, now() + interval '15 minutes');
  return v_path;
end $$;

create or replace function public.review_slot_ok(p_name text)
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.review_slots where path = p_name and not used and expires_at > now())
$$;

create or replace function public.review_submit(p_token text, p_name text, p_rating int, p_body text, p_photo text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare r record; v_photo text := nullif(trim(coalesce(p_photo, '')), '');
begin
  select * into r from public.review_requests where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex') and not used and expires_at > now() for update;
  if not found then return false; end if;
  if char_length(trim(coalesce(p_name, ''))) not between 2 and 60 then return false; end if;
  if p_rating is null or p_rating not between 1 and 5 then return false; end if;
  if char_length(trim(coalesce(p_body, ''))) not between 10 and 1200 then return false; end if;
  if v_photo is not null then
    if not exists (select 1 from public.review_slots where path = v_photo and request_id = r.id) then return false; end if;
    if not exists (select 1 from storage.objects where bucket_id = 'reviews' and name = v_photo) then return false; end if;
    update public.review_slots set used = true where path = v_photo;
  end if;
  insert into public.reviews (boat_slug, boat_name, author_name, rating, body, photo_path, tour_label, status, source)
  values (r.boat_slug, r.boat_name, trim(p_name), p_rating, trim(p_body), v_photo,
          case when r.tour_end is not null then to_char(r.tour_end, 'YYYY-MM') else null end, 'pending', 'customer');
  update public.review_requests set used = true where id = r.id;
  return true;
end $$;

grant execute on function public.admin_create_review_request(text, text, text, text, date, uuid) to authenticated;
grant execute on function public.review_request_get(text) to anon, authenticated;
grant execute on function public.review_upload_slot(text, text) to anon, authenticated;
grant execute on function public.review_slot_ok(text) to anon, authenticated;
grant execute on function public.review_submit(text, text, int, text, text) to anon, authenticated;

-- Yorum fotoğrafları: herkese açık okunur, yalnızca geçerli bir yükleme izniyle yazılır.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reviews', 'reviews', true, 5242880, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg'];

drop policy if exists "reviews admin all" on storage.objects;
create policy "reviews admin all" on storage.objects for all
  using (bucket_id = 'reviews' and public.is_admin()) with check (bucket_id = 'reviews' and public.is_admin());
drop policy if exists "reviews customer upload" on storage.objects;
create policy "reviews customer upload" on storage.objects for insert
  with check (bucket_id = 'reviews' and public.review_slot_ok(name));
drop policy if exists "reviews public read" on storage.objects;
create policy "reviews public read" on storage.objects for select using (bucket_id = 'reviews');
