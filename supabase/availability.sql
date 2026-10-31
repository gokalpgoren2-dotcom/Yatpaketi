-- Müsaitlik: ziyaretçiler yalnızca dolu günlerin başlangıç/bitiş tarihlerini görür (not ve diğer bilgiler görünmez).
-- Supabase > SQL Editor'de bir kez çalıştırın. (Talep fonksiyonunun güncel hâlini de içerir.)

create or replace function public.boat_blocked_ranges(p_boat_slug text)
returns table (start_date date, end_date date)
language sql stable security definer set search_path = public as $$
  select a.start_date, a.end_date
  from public.availability_blocks a
  join public.boats b on b.id = a.boat_id
  where b.slug = p_boat_slug and b.is_published and a.end_date >= current_date
  order by a.start_date;
$$;

revoke all on function public.boat_blocked_ranges(text) from public;
grant execute on function public.boat_blocked_ranges(text) to anon, authenticated;

create or replace function public.submit_reservation(
  p_boat_slug text, p_name text, p_phone text, p_email text,
  p_start date, p_end date, p_guests int, p_message text, p_ip_hash text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_boat record;
  v_name text := btrim(coalesce(p_name, ''));
  v_phone text := btrim(coalesce(p_phone, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_msg text := btrim(coalesce(p_message, ''));
  v_digits text := regexp_replace(btrim(coalesce(p_phone, '')), '\D', '', 'g');
begin
  if char_length(v_name) < 2 or char_length(v_name) > 100 then return jsonb_build_object('ok', false, 'error', 'name'); end if;
  if v_phone = '' and v_email = '' then return jsonb_build_object('ok', false, 'error', 'contact'); end if;
  if v_phone <> '' and (char_length(v_digits) < 7 or char_length(v_digits) > 15) then return jsonb_build_object('ok', false, 'error', 'phone'); end if;
  if v_email <> '' and (char_length(v_email) > 200 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then return jsonb_build_object('ok', false, 'error', 'email'); end if;
  if p_start is null or p_end is null or p_start < current_date or p_end < p_start or (p_end - p_start) > 60 then return jsonb_build_object('ok', false, 'error', 'dates'); end if;
  if p_guests is null or p_guests < 1 or p_guests > 100 then return jsonb_build_object('ok', false, 'error', 'guests'); end if;
  if char_length(v_msg) > 2000 then return jsonb_build_object('ok', false, 'error', 'message'); end if;

  if coalesce(p_boat_slug, '') <> '' then
    select id, name, guests into v_boat from public.boats where slug = p_boat_slug and is_published;
    if not found then return jsonb_build_object('ok', false, 'error', 'boat'); end if;
    if p_guests > v_boat.guests then return jsonb_build_object('ok', false, 'error', 'capacity'); end if;
    if exists (select 1 from public.availability_blocks a where a.boat_id = v_boat.id and p_start <= a.end_date and p_end >= a.start_date) then
      return jsonb_build_object('ok', false, 'error', 'unavailable');
    end if;
  end if;

  -- Hız sınırları: aynı ağdan saatte 5, tüm site için saatte 60, aynı telefon/e-posta için günde 3 talep.
  if p_ip_hash is not null and (select count(*) from public.reservation_requests where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 5 then
    return jsonb_build_object('ok', false, 'error', 'rate');
  end if;
  if (select count(*) from public.reservation_requests where created_at > now() - interval '1 hour') >= 60 then
    return jsonb_build_object('ok', false, 'error', 'rate');
  end if;
  if (select count(*) from public.reservation_requests
        where created_at > now() - interval '1 day'
          and ((v_email <> '' and lower(coalesce(email, '')) = v_email)
            or (v_phone <> '' and regexp_replace(coalesce(phone, ''), '\D', '', 'g') = v_digits))) >= 3 then
    return jsonb_build_object('ok', false, 'error', 'rate');
  end if;

  insert into public.reservation_requests (boat_id, boat_name, customer_name, phone, email, start_date, end_date, guests, message, status, ip_hash, consent_at)
  values (v_boat.id, v_boat.name, v_name, nullif(v_phone, ''), nullif(v_email, ''), p_start, p_end, p_guests, nullif(v_msg, ''), 'new', p_ip_hash, now());

  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.submit_reservation(text, text, text, text, date, date, int, text, text) from public;
grant execute on function public.submit_reservation(text, text, text, text, date, date, int, text, text) to anon, authenticated;
