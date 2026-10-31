-- Sözleşme e-postaları için. Supabase > SQL Editor'de bir kez çalıştırın (tekrar çalıştırmak zararsızdır).

alter table public.customer_portals add column if not exists contract_emailed_at timestamptz;

-- Müşterinin yeni yüklediği imzalı dosya, yükleme yolu geçerliyken (15 dk) sunucu tarafından e-postaya eklenebilsin.
create or replace function public.portal_signed_ok(p_name text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.portal_upload_slots where path = p_name and used and expires_at > now())
$$;
grant execute on function public.portal_signed_ok(text) to anon, authenticated;

drop policy if exists "contracts portal read" on storage.objects;
create policy "contracts portal read" on storage.objects for select
  using (bucket_id = 'contracts' and (public.portal_contract_ok(name) or public.portal_signed_ok(name)));

-- portal_get artık müşterinin e-postasını da döndürür.
create or replace function public.portal_get(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public, extensions as $$
declare v_id uuid := public.portal_pid(p_token); r record;
begin
  if v_id is null then return null; end if;
  select * into r from public.customer_portals where id = v_id;
  return jsonb_build_object(
    'email', r.email, 'customer_name', r.customer_name, 'boat_name', r.boat_name,
    'tour_start', r.tour_start, 'tour_end', r.tour_end,
    'location_text', r.location_text, 'location_updated_at', r.location_updated_at,
    'contract_path', r.contract_path, 'signed_at', r.signed_at,
    'checklist', coalesce((select jsonb_agg(jsonb_build_object('label', c.label, 'done', c.done) order by c.sort_order, c.label)
                           from public.portal_checklist c where c.portal_id = v_id), '[]'::jsonb)
  );
end $$;
