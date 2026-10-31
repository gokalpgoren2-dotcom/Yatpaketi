-- yatpaketi veritabanı şeması. Supabase > SQL Editor içinde BİR KEZ çalıştırın.
-- Tekrar çalıştırmak güvenlidir (create ... if not exists / on conflict).

-- ============ Yöneticiler ============
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins for select using (user_id = auth.uid());

-- ============ Tablolar ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_tr text not null,
  name_en text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_tr text not null,
  name_en text,
  blurb_tr text, blurb_en text,
  intro_tr text, intro_en text,
  cover_path text,
  seo_title text, seo_description text,
  sort_order int not null default 0,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.boats (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  brand text, model text,
  year int, refit_year int,
  length_m numeric(5,1), width_m numeric(4,1),
  cabins int not null default 0,
  guests int not null default 1,
  crew int not null default 0,
  captain_included boolean not null default true,
  home_port text,
  description_tr text, description_en text,
  equipment text[] not null default '{}',
  water_sports text[] not null default '{}',
  price_mode text not null default 'show' check (price_mode in ('show','ask')),
  currency text not null default 'EUR' check (currency in ('EUR','TRY','USD')),
  price_daily numeric(12,2) check (price_daily is null or price_daily >= 0),
  price_weekly numeric(12,2) check (price_weekly is null or price_weekly >= 0),
  is_published boolean not null default false,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  seo_title text, seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.boat_destinations (
  boat_id uuid not null references public.boats(id) on delete cascade,
  destination_id uuid not null references public.destinations(id) on delete cascade,
  primary key (boat_id, destination_id)
);

create table if not exists public.boat_images (
  id uuid primary key default gen_random_uuid(),
  boat_id uuid not null references public.boats(id) on delete cascade,
  path text not null,
  alt text,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists boat_images_boat_idx on public.boat_images(boat_id, sort_order);

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  boat_id uuid not null references public.boats(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  kind text not null default 'booked' check (kind in ('booked','closed')),
  note text,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.season_prices (
  id uuid primary key default gen_random_uuid(),
  boat_id uuid not null references public.boats(id) on delete cascade,
  name text,
  start_date date not null,
  end_date date not null,
  price_daily numeric(12,2) check (price_daily is null or price_daily >= 0),
  price_weekly numeric(12,2) check (price_weekly is null or price_weekly >= 0),
  check (end_date >= start_date)
);

create table if not exists public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  boat_id uuid references public.boats(id) on delete set null,
  boat_name text,
  customer_name text not null,
  phone text,
  email text,
  start_date date, end_date date,
  guests int,
  message text,
  status text not null default 'new' check (status in ('new','contacted','offered','confirmed','cancelled')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_tr text not null, title_en text,
  excerpt_tr text, excerpt_en text,
  content_tr text, content_en text,
  cover_path text,
  seo_title text, seo_description text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- Genel (herkese açık) site ayarları. Buraya GİZLİ bilgi koymayın.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists boats_touch on public.boats;
create trigger boats_touch before update on public.boats for each row execute function public.touch_updated_at();

-- ============ Row Level Security ============
alter table public.categories enable row level security;
alter table public.destinations enable row level security;
alter table public.boats enable row level security;
alter table public.boat_destinations enable row level security;
alter table public.boat_images enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.season_prices enable row level security;
alter table public.reservation_requests enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;

-- Herkese açık okuma: yalnızca yayınlanmış içerik
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (is_active);
drop policy if exists "public read destinations" on public.destinations;
create policy "public read destinations" on public.destinations for select using (is_published);
drop policy if exists "public read boats" on public.boats;
create policy "public read boats" on public.boats for select using (is_published);
drop policy if exists "public read boat_destinations" on public.boat_destinations;
create policy "public read boat_destinations" on public.boat_destinations for select
  using (exists (select 1 from public.boats b where b.id = boat_id and b.is_published));
drop policy if exists "public read boat_images" on public.boat_images;
create policy "public read boat_images" on public.boat_images for select
  using (exists (select 1 from public.boats b where b.id = boat_id and b.is_published));
drop policy if exists "public read season_prices" on public.season_prices;
create policy "public read season_prices" on public.season_prices for select
  using (exists (select 1 from public.boats b where b.id = boat_id and b.is_published));
drop policy if exists "public read blog" on public.blog_posts;
create policy "public read blog" on public.blog_posts for select using (status = 'published');
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
-- availability_blocks ve reservation_requests için herkese açık politika YOK.
-- Rezervasyon talepleri yalnızca sunucu tarafından (doğrulama + hız sınırı ile) eklenir.

-- Yönetici: her şey
do $$
declare t text;
begin
  foreach t in array array['categories','destinations','boats','boat_destinations','boat_images',
    'availability_blocks','season_prices','reservation_requests','blog_posts','site_settings']
  loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ============ Fotoğraf depolama ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ============ Başlangıç kategorileri ve destinasyonlar ============
insert into public.categories (slug, name_tr, name_en, sort_order) values
  ('gulet','Gulet','Gulet',1), ('motoryat','Motoryat','Motor Yacht',2), ('katamaran','Katamaran','Catamaran',3),
  ('yelkenli','Yelkenli','Sailing Yacht',4), ('trawler','Trawler','Trawler',5), ('luks-yat','Lüks Yat','Luxury Yacht',6),
  ('gunluk','Günlük Tekneler','Daily Boats',7)
on conflict (slug) do nothing;

insert into public.destinations (slug, name_tr, name_en, blurb_tr, intro_tr, sort_order, is_published) values
  ('gocek','Göcek','Gocek','12 Ada ve sakin koylar','Göcek, korunaklı koyları ve 12 Ada rotasıyla mavi yolculuğun en bilinen çıkış noktalarından biridir.',1,true),
  ('bodrum','Bodrum','Bodrum','Gece hayatı ve Ege esintisi','Bodrum çıkışlı rotalar Datça, Gökova ve Yunan adalarına uzanır.',2,true),
  ('fethiye','Fethiye','Fethiye','Ölüdeniz ve Kelebekler Vadisi','Fethiye, Ölüdeniz ve çevresindeki koylarla hem günlük hem haftalık rotalara uygundur.',3,true),
  ('marmaris','Marmaris','Marmaris','Orhaniye ve Hisarönü koyları','Marmaris, Orhaniye ve Hisarönü koyları ile Datça Yarımadası rotalarının çıkış noktasıdır.',4,true),
  ('antalya','Antalya','Antalya','Kekova ve Akdeniz''in turkuazı','Antalya çıkışlı rotalar Kekova ve Akdeniz kıyısının berrak sularını kapsar.',5,true)
on conflict (slug) do nothing;
