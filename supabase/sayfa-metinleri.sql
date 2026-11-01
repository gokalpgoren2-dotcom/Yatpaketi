-- Sayfa metinleri: S.S.S ve Yat ve Yatcilik Kulturu sayfalarini admin panelden duzenlemek icin tablo.
-- Supabase > SQL Editor'de calistirin. Tekrar calistirmak guvenlidir.
create table if not exists public.site_texts (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_texts enable row level security;
drop policy if exists "public read site_texts" on public.site_texts;
create policy "public read site_texts" on public.site_texts for select using (true);
drop policy if exists "admin all" on public.site_texts;
create policy "admin all" on public.site_texts for all using (public.is_admin()) with check (public.is_admin());
