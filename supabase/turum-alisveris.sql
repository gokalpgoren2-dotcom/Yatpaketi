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
