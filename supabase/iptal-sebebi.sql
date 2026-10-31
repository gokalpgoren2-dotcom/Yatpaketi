-- Rezervasyon taleplerine iptal sebebi ve iptal tarihi. Supabase > SQL Editor'de çalıştırın (tekrar çalıştırmak zararsızdır).
alter table public.reservation_requests add column if not exists cancel_reason text;
alter table public.reservation_requests add column if not exists cancelled_at timestamptz;
alter table public.reservation_requests add column if not exists cancel_files text[] not null default '{}';
