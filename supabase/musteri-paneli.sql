-- MÜŞTERİ PANELİ. Supabase > SQL Editor'de bir kez çalıştırın.
-- Müşteri e-posta + kişiye özel kodla girer; kod tur bitiş tarihinden sonra çalışmaz.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.customer_portals (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  customer_name text,
  boat_name text not null,
  tour_start date not null,
  tour_end date not null,
  code_hash text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  failed_attempts int not null default 0,
  locked_until timestamptz,
  location_text text,
  location_updated_at timestamptz,
  contract_path text,
  signed_path text,
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  check (tour_end >= tour_start)
);

create table if not exists public.portal_checklist (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid not null references public.customer_portals(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_sessions (
  token_hash text primary key,
  portal_id uuid not null references public.customer_portals(id) on delete cascade,
  expires_at timestamptz not null
);

create table if not exists public.portal_upload_slots (
  path text primary key,
  portal_id uuid not null references public.customer_portals(id) on delete cascade,
  expires_at timestamptz not null,
  used boolean not null default false
);

alter table public.customer_portals enable row level security;
alter table public.portal_checklist enable row level security;
alter table public.portal_sessions enable row level security;
alter table public.portal_upload_slots enable row level security;

drop policy if exists "admin all" on public.customer_portals;
create policy "admin all" on public.customer_portals for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all" on public.portal_checklist;
create policy "admin all" on public.portal_checklist for all using (public.is_admin()) with check (public.is_admin());
-- portal_sessions ve portal_upload_slots için hiçbir politika yok: yalnızca aşağıdaki güvenli fonksiyonlar erişir.

create or replace function public.portal_today() returns date
language sql stable as $$ select (now() at time zone 'Europe/Istanbul')::date $$;

-- Rastgele kod üretir (karışan harfler yok: 0/O, 1/I yok).
create or replace function public.portal_new_code() returns text
language plpgsql set search_path = public, extensions as $$
declare alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea := gen_random_bytes(10); v text := ''; i int;
begin
  for i in 0..9 loop v := v || substr(alphabet, (get_byte(b, i) % 32) + 1, 1); end loop;
  return v;
end $$;

create or replace function public.admin_create_portal(p_email text, p_name text, p_boat text, p_start date, p_end date)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_code text; v_id uuid;
begin
  if not public.is_admin() then raise exception 'yetkisiz'; end if;
  v_code := public.portal_new_code();
  insert into public.customer_portals (email, customer_name, boat_name, tour_start, tour_end, code_hash)
  values (lower(trim(p_email)), nullif(trim(p_name), ''), trim(p_boat), p_start, p_end, crypt(v_code, gen_salt('bf')))
  returning id into v_id;
  insert into public.portal_checklist (portal_id, label, sort_order) values
    (v_id, 'Sözleşme imzalandı', 1),
    (v_id, 'Tekne temizliği tamamlandı', 2),
    (v_id, 'Alışveriş / ikmal yapıldı', 3),
    (v_id, 'Yakıt ve su dolumu yapıldı', 4),
    (v_id, 'Teknik kontrol yapıldı', 5),
    (v_id, 'Kaptan ve mürettebat hazır', 6);
  return jsonb_build_object('id', v_id, 'code', substr(v_code, 1, 5) || '-' || substr(v_code, 6, 5));
end $$;

create or replace function public.admin_reset_code(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare v_code text;
begin
  if not public.is_admin() then raise exception 'yetkisiz'; end if;
  v_code := public.portal_new_code();
  update public.customer_portals set code_hash = crypt(v_code, gen_salt('bf')), failed_attempts = 0, locked_until = null, status = 'active' where id = p_id;
  delete from public.portal_sessions where portal_id = p_id;
  return jsonb_build_object('code', substr(v_code, 1, 5) || '-' || substr(v_code, 6, 5));
end $$;

-- Müşteri girişi. Başarılıysa oturum anahtarı döner, değilse null (nedeni söylenmez).
create or replace function public.portal_login(p_email text, p_code text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare r record; v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')); v_token text;
begin
  for r in
    select * from public.customer_portals
    where lower(email) = lower(trim(coalesce(p_email, ''))) and status = 'active' and tour_end >= public.portal_today()
    order by created_at desc
  loop
    if r.locked_until is not null and r.locked_until > now() then continue; end if;
    if crypt(v_code, r.code_hash) = r.code_hash then
      update public.customer_portals set failed_attempts = 0, locked_until = null where id = r.id;
      v_token := encode(gen_random_bytes(32), 'hex');
      delete from public.portal_sessions where expires_at < now();
      insert into public.portal_sessions (token_hash, portal_id, expires_at)
      values (encode(digest(v_token, 'sha256'), 'hex'), r.id, now() + interval '12 hours');
      return v_token;
    else
      update public.customer_portals
        set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
            locked_until = case when failed_attempts + 1 >= 5 then now() + interval '15 minutes' else locked_until end
        where id = r.id;
    end if;
  end loop;
  return null;
end $$;

-- Oturumdan portal numarasını bulur (yalnızca diğer fonksiyonlar kullanır).
create or replace function public.portal_pid(p_token text) returns uuid
language sql stable security definer set search_path = public, extensions as $$
  select s.portal_id from public.portal_sessions s
  join public.customer_portals p on p.id = s.portal_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and s.expires_at > now() and p.status = 'active' and p.tour_end >= public.portal_today()
$$;

create or replace function public.portal_get(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token); r record;
begin
  if v_id is null then return null; end if;
  select * into r from public.customer_portals where id = v_id;
  return jsonb_build_object(
    'customer_name', r.customer_name, 'boat_name', r.boat_name,
    'tour_start', r.tour_start, 'tour_end', r.tour_end,
    'location_text', r.location_text, 'location_updated_at', r.location_updated_at,
    'contract_path', r.contract_path, 'signed_at', r.signed_at,
    'checklist', coalesce((select jsonb_agg(jsonb_build_object('label', c.label, 'done', c.done) order by c.sort_order, c.label)
                           from public.portal_checklist c where c.portal_id = v_id), '[]'::jsonb)
  );
end $$;

create or replace function public.portal_logout(p_token text) returns void
language sql security definer set search_path = public, extensions as $$
  delete from public.portal_sessions where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
$$;

-- İmzalı sözleşme yükleme: önce tek kullanımlık yol alınır, dosya o yola yüklenir, sonra bitiş bildirilir.
create or replace function public.portal_upload_slot(p_token text, p_ext text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token); v_ext text := lower(coalesce(p_ext, '')); v_path text;
begin
  if v_id is null then return null; end if;
  if v_ext not in ('pdf', 'jpg', 'jpeg', 'png') then return null; end if;
  v_path := 'signed/' || v_id::text || '/' || gen_random_uuid()::text || '.' || v_ext;
  insert into public.portal_upload_slots (path, portal_id, expires_at) values (v_path, v_id, now() + interval '15 minutes');
  return v_path;
end $$;

create or replace function public.portal_finish_upload(p_token text, p_path text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token);
begin
  if v_id is null then return false; end if;
  if not exists (select 1 from public.portal_upload_slots where path = p_path and portal_id = v_id and not used and expires_at > now()) then return false; end if;
  if not exists (select 1 from storage.objects where bucket_id = 'contracts' and name = p_path) then return false; end if;
  update public.portal_upload_slots set used = true where path = p_path;
  update public.customer_portals set signed_path = p_path, signed_at = now() where id = v_id;
  update public.portal_checklist set done = true, updated_at = now() where portal_id = v_id and label = 'Sözleşme imzalandı';
  return true;
end $$;

create or replace function public.portal_slot_ok(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.portal_upload_slots where path = p_name and not used and expires_at > now())
$$;

create or replace function public.portal_contract_ok(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.customer_portals where contract_path = p_name and status = 'active' and tour_end >= public.portal_today())
$$;

-- İç fonksiyonları dışarıdan çağrılamaz yap.
revoke execute on function public.portal_pid(text) from public, anon, authenticated;
revoke execute on function public.portal_new_code() from public, anon, authenticated;
revoke execute on function public.admin_create_portal(text, text, text, date, date) from public, anon;
revoke execute on function public.admin_reset_code(uuid) from public, anon;
grant execute on function public.admin_create_portal(text, text, text, date, date) to authenticated;
grant execute on function public.admin_reset_code(uuid) to authenticated;
grant execute on function public.portal_login(text, text) to anon, authenticated;
grant execute on function public.portal_get(text) to anon, authenticated;
grant execute on function public.portal_logout(text) to anon, authenticated;
grant execute on function public.portal_upload_slot(text, text) to anon, authenticated;
grant execute on function public.portal_finish_upload(text, text) to anon, authenticated;
grant execute on function public.portal_slot_ok(text) to anon, authenticated;
grant execute on function public.portal_contract_ok(text) to anon, authenticated;

-- Özel sözleşme deposu (herkese açık değil, en çok 10 MB, yalnızca PDF/JPG/PNG).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contracts', 'contracts', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "contracts admin all" on storage.objects;
create policy "contracts admin all" on storage.objects for all
  using (bucket_id = 'contracts' and public.is_admin()) with check (bucket_id = 'contracts' and public.is_admin());
drop policy if exists "contracts portal upload" on storage.objects;
create policy "contracts portal upload" on storage.objects for insert
  with check (bucket_id = 'contracts' and public.portal_slot_ok(name));
drop policy if exists "contracts portal read" on storage.objects;
create policy "contracts portal read" on storage.objects for select
  using (bucket_id = 'contracts' and public.portal_contract_ok(name));
