-- Tekne tiplerine tanıtım metni, fotoğraf ve Google alanları. Supabase > SQL Editor'de bir kez çalıştırın.
alter table public.categories add column if not exists intro_tr text;
alter table public.categories add column if not exists cover_path text;
alter table public.categories add column if not exists seo_title text;
alter table public.categories add column if not exists seo_description text;
