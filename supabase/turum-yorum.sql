-- TURUM SAYFASINDA TUR YORUMU. Supabase > SQL Editor'de bir kez çalıştırın (önce yorumlar.sql çalışmış olmalı).
-- Ekibiniz bir turun yorumunu açınca, giriş kodu tur bittikten sonra da 45 gün boyunca yalnızca yorum için çalışır.

alter table public.customer_portals add column if not exists review_open boolean not null default false;

create or replace function public.portal_login(p_email text, p_code text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare r record; v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g')); v_token text;
begin
  for r in
    select * from public.customer_portals
    where lower(email) = lower(trim(coalesce(p_email, ''))) and status = 'active'
      and (tour_end >= public.portal_today() or (review_open and tour_end + 45 >= public.portal_today()))
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

create or replace function public.portal_pid(p_token text) returns uuid
language sql stable security definer set search_path = public, extensions as $$
  select s.portal_id from public.portal_sessions s
  join public.customer_portals p on p.id = s.portal_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and s.expires_at > now() and p.status = 'active'
    and (p.tour_end >= public.portal_today() or (p.review_open and p.tour_end + 45 >= public.portal_today()))
$$;

create or replace function public.portal_get(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_id uuid := public.portal_pid(p_token);
  r record; v_opens timestamptz; v_open boolean;
begin
  if v_id is null then return null; end if;
  select * into r from public.customer_portals where id = v_id;
  v_opens := (r.tour_start::timestamp at time zone 'Europe/Istanbul') - interval '12 hours';
  v_open := now() >= v_opens;
  return jsonb_build_object(
    'email', r.email, 'customer_name', r.customer_name, 'boat_name', r.boat_name,
    'tour_start', r.tour_start, 'tour_end', r.tour_end,
    'location_open', v_open, 'location_opens_at', v_opens,
    'location_text', case when v_open then r.location_text end,
    'location_updated_at', case when v_open then r.location_updated_at end,
    'lat', case when v_open then r.lat end,
    'lng', case when v_open then r.lng end,
    'contract_path', r.contract_path, 'signed_at', r.signed_at,
    'review_open', r.review_open,
    'review_done', exists (select 1 from public.review_requests q where q.portal_id = r.id and q.used),
    'checklist', coalesce((select jsonb_agg(jsonb_build_object('label', c.label, 'done', c.done) order by c.sort_order, c.label)
                           from public.portal_checklist c where c.portal_id = v_id), '[]'::jsonb)
  );
end $$;

-- Ortak yorum kaydı (hem e-posta bağlantısı hem Turum sayfası kullanır).
create or replace function public._review_insert(p_req uuid, p_name text, p_rating int, p_body text, p_photo text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare r record; v_photo text := nullif(trim(coalesce(p_photo, '')), '');
begin
  select * into r from public.review_requests where id = p_req and not used and expires_at > now() for update;
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
revoke execute on function public._review_insert(uuid, text, int, text, text) from public, anon, authenticated;

create or replace function public.review_submit(p_token text, p_name text, p_rating int, p_body text, p_photo text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare v_req uuid;
begin
  select id into v_req from public.review_requests where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex') and not used and expires_at > now();
  if v_req is null then return false; end if;
  return public._review_insert(v_req, p_name, p_rating, p_body, p_photo);
end $$;

-- Turum sayfasından yorum: oturum anahtarıyla, yalnızca ekibiniz yorumu açtıysa ve daha önce yorum yapılmadıysa.
create or replace function public._portal_review_req(p_token text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare v_pid uuid := public.portal_pid(p_token); p record; v_req uuid;
begin
  if v_pid is null then return null; end if;
  select * into p from public.customer_portals where id = v_pid;
  if not p.review_open then return null; end if;
  if exists (select 1 from public.review_requests where portal_id = v_pid and used) then return null; end if;
  select id into v_req from public.review_requests where portal_id = v_pid and not used and expires_at > now() order by created_at desc limit 1;
  if v_req is null then
    insert into public.review_requests (token_hash, portal_id, email, customer_name, boat_slug, boat_name, tour_end, expires_at)
    values (encode(gen_random_bytes(32), 'hex'), v_pid, p.email, p.customer_name,
            (select slug from public.boats where name = p.boat_name limit 1), p.boat_name, p.tour_end, now() + interval '45 days')
    returning id into v_req;
  end if;
  return v_req;
end $$;
revoke execute on function public._portal_review_req(text) from public, anon, authenticated;

create or replace function public.portal_review_slot(p_token text, p_ext text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare v_req uuid := public._portal_review_req(p_token); v_path text;
begin
  if v_req is null or lower(coalesce(p_ext, '')) <> 'jpg' then return null; end if;
  delete from public.review_slots where expires_at < now() and not used;
  v_path := 'r/' || gen_random_uuid()::text || '.jpg';
  insert into public.review_slots (path, request_id, expires_at) values (v_path, v_req, now() + interval '15 minutes');
  return v_path;
end $$;

create or replace function public.portal_review_submit(p_token text, p_name text, p_rating int, p_body text, p_photo text) returns boolean
language plpgsql security definer set search_path = public, extensions as $$
declare v_req uuid := public._portal_review_req(p_token);
begin
  if v_req is null then return false; end if;
  return public._review_insert(v_req, p_name, p_rating, p_body, p_photo);
end $$;

grant execute on function public.review_submit(text, text, int, text, text) to anon, authenticated;
grant execute on function public.portal_review_slot(text, text) to anon, authenticated;
grant execute on function public.portal_review_submit(text, text, int, text, text) to anon, authenticated;
grant execute on function public.portal_login(text, text) to anon, authenticated;
grant execute on function public.portal_get(text) to anon, authenticated;
revoke execute on function public.portal_pid(text) from public, anon, authenticated;
