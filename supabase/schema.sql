create extension if not exists "pgcrypto";

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  partner text not null,
  question text not null,
  answer text not null,
  fact text not null,
  reflection text,
  created_at timestamptz not null default now(),
  is_public boolean not null default false,
  is_highlighted boolean not null default false,
  is_private boolean not null default false
);

alter table public.entries enable row level security;

drop policy if exists "allow insert entries" on public.entries;
create policy "allow insert entries"
on public.entries
for insert
to anon
with check (true);

drop policy if exists "allow read public entries" on public.entries;
create policy "allow read public entries"
on public.entries
for select
to anon
using (is_public = true and is_private = false);

drop policy if exists "allow update entries" on public.entries;
create policy "allow update entries"
on public.entries
for update
to anon
using (true)
with check (true);

