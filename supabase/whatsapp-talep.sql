-- WhatsApp düğmesiyle gelen talepleri de panele kaydeder. Supabase > SQL Editor'de bir kez çalıştırın.
-- Bu talepte telefon/e-posta yoktur (müşteri WhatsApp'tan yazar); panelde "WhatsApp" etiketiyle görünür.

alter table public.reservation_requests add column if not exists source text not null default 'form';
alter table public.reservation_requests add column if not exists ip_hash text;

create or replace function public.submit_whatsapp_request(
  p_boat_slug text, p_name text, p_start date, p_end date, p_guests int, p_ip_hash text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_boat record;
  v_name text := btrim(coalesce(p_name, ''));
begin
  if p_start is null or p_end is null or p_start < current_date or p_end < p_start or (p_end - p_start) > 60 then return jsonb_build_object('ok', false, 'error', 'dates'); end if;
  if p_guests is null or p_guests < 1 or p_guests > 100 then return jsonb_build_object('ok', false, 'error', 'guests'); end if;
  if char_length(v_name) > 100 then v_name := left(v_name, 100); end if;
  if coalesce(p_boat_slug, '') = '' then return jsonb_build_object('ok', false, 'error', 'boat'); end if;
  select id, name into v_boat from public.boats where slug = p_boat_slug and is_published;
  if not found then return jsonb_build_object('ok', false, 'error', 'boat'); end if;

  -- Aynı ağdan aynı tekne ve tarih için 1 saat içinde tekrar kayıt açılmaz (çift tıklama).
  if p_ip_hash is not null and exists (
    select 1 from public.reservation_requests
    where ip_hash = p_ip_hash and source = 'whatsapp' and boat_id = v_boat.id and start_date = p_start and end_date = p_end
      and created_at > now() - interval '1 hour'
  ) then return jsonb_build_object('ok', true, 'duplicate', true); end if;

  -- Hız sınırları: aynı ağdan saatte 10, tüm site için saatte 100.
  if p_ip_hash is not null and (select count(*) from public.reservation_requests where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 10 then
    return jsonb_build_object('ok', false, 'error', 'rate');
  end if;
  if (select count(*) from public.reservation_requests where created_at > now() - interval '1 hour') >= 100 then
    return jsonb_build_object('ok', false, 'error', 'rate');
  end if;

  insert into public.reservation_requests (boat_id, boat_name, customer_name, start_date, end_date, guests, message, status, source, ip_hash)
  values (v_boat.id, v_boat.name, coalesce(nullif(v_name, ''), 'WhatsApp talebi (isim yok)'), p_start, p_end, p_guests,
          'WhatsApp düğmesine basıldı. Müşterinin mesajı ve telefonu WhatsApp''tan gelecek; mesaj gönderilmemiş olabilir.', 'new', 'whatsapp', p_ip_hash);

  return jsonb_build_object('ok', true);
end $$;

revoke all on function public.submit_whatsapp_request(text, text, date, date, int, text) from public;
grant execute on function public.submit_whatsapp_request(text, text, date, date, int, text) to anon, authenticated;
