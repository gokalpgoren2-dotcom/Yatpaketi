-- YATLAR: TANITIM PDF'İ. Supabase > SQL Editor'de bir kez çalıştırın.
alter table public.boats add column if not exists brochure_path text;
-- Fotoğraf deposuna PDF izni (en çok 25 MB)
update storage.buckets
set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','application/pdf'], file_size_limit = 26214400
where id = 'media';
