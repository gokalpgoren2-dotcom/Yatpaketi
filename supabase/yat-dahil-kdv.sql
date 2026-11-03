-- YATLAR: FİYATA DAHİL OLANLAR / OLMAYANLAR VE KDV. Supabase > SQL Editor'de bir kez çalıştırın.
alter table public.boats add column if not exists included text[] not null default '{}';
alter table public.boats add column if not exists excluded text[] not null default '{}';
alter table public.boats add column if not exists vat_mode text not null default 'none' check (vat_mode in ('none', 'included', 'excluded'));
alter table public.boats add column if not exists vat_rate numeric not null default 20;
