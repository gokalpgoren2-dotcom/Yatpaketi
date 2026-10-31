-- Rezervasyon taleplerine iptal sebebi alanı. Supabase > SQL Editor'de bir kez çalıştırın.
alter table public.reservation_requests add column if not exists cancel_reason text;
