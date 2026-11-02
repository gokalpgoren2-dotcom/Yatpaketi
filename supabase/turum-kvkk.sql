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
