create table if not exists public.content_pages (
  slug text primary key check (slug in ('home', 'about')),
  content jsonb not null default '{}'::jsonb,
  published_content jsonb not null default '{}'::jsonb,
  updated_by text,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.content_pages enable row level security;
