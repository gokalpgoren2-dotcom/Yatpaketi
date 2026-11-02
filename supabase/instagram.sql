-- INSTAGRAM BAĞLANTISI İÇİN GİZLİ AYARLAR. Supabase > SQL Editor'de bir kez çalıştırın.
-- Bu tablo herkese açık değildir: yalnızca yönetici yazar, site sunucusu gizli anahtarla okur.
create table if not exists public.private_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.private_settings enable row level security;
drop policy if exists "admin all" on public.private_settings;
create policy "admin all" on public.private_settings for all using (public.is_admin()) with check (public.is_admin());
