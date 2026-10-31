-- Hazırlık listesinde her işarette müşteriye e-posta: aynı madde için tekrar e-posta gitmesin diye kayıt tutulur.
-- Supabase > SQL Editor'de bir kez çalıştırın (tekrar çalıştırmak zararsızdır).
alter table public.portal_checklist add column if not exists notified_at timestamptz;
