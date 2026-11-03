-- YATLAR: AYLIK GÜNLÜK FİYAT. Supabase > SQL Editor'de bir kez çalıştırın.
-- Nisan–Kasım arası her ay için günlük fiyat (ör. {"4": 1200, "7": 2000}).
alter table public.boats add column if not exists monthly_prices jsonb not null default '{}'::jsonb;
