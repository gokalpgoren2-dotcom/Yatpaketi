-- Yazılar (Yatpaketi Rehberi, Blog, sabit sayfalar). Supabase > SQL Editor'de bir kez çalıştırın.
alter table public.blog_posts add column if not exists kind text not null default 'blog' check (kind in ('blog', 'guide', 'page'));
alter table public.blog_posts add column if not exists sort_order int not null default 0;
create index if not exists blog_posts_kind_idx on public.blog_posts (kind, status, sort_order);
