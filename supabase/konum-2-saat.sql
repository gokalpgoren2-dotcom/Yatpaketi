-- Yat konumu artık biniş saatinden 2 saat önce açılır.
-- Biniş saati her müşteri paneli için yönetim panelinden girilir; girilmezse 14:00 kabul edilir.
alter table public.customer_portals add column if not exists boarding_time time;

create or replace function public.portal_get(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare
  v_id uuid := public.portal_pid(p_token);
  r record; v_opens timestamptz; v_open boolean;
begin
  if v_id is null then return null; end if;
  select * into r from public.customer_portals where id = v_id;
  v_opens := ((r.tour_start + coalesce(r.boarding_time, time '14:00'))::timestamp at time zone 'Europe/Istanbul') - interval '2 hours';
  v_open := now() >= v_opens;
  return jsonb_build_object(
    'email', r.email, 'customer_name', r.customer_name, 'boat_name', r.boat_name,
    'tour_start', r.tour_start, 'tour_end', r.tour_end,
    'location_open', v_open, 'location_opens_at', v_opens, 'boarding_time', to_char(coalesce(r.boarding_time, time '14:00'), 'HH24:MI'),
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
