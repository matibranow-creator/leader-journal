-- Uruchom w SQL Editor Supabase po przejściu na logowanie email (Auth).
-- Założenie: kolumna public.entries.author przechowuje email użytkownika.

alter table public.entries enable row level security;

drop policy if exists "allow insert entries" on public.entries;
drop policy if exists "allow read public entries" on public.entries;
drop policy if exists "allow update entries" on public.entries;

drop policy if exists "entries_select_own_or_admin" on public.entries;
create policy "entries_select_own_or_admin"
on public.entries
for select
to authenticated
using (
  lower(author) = lower(auth.email())
  or lower(auth.email()) in ('admin1@example.com', 'admin2@example.com')
);

drop policy if exists "entries_insert_own_or_admin" on public.entries;
create policy "entries_insert_own_or_admin"
on public.entries
for insert
to authenticated
with check (
  lower(author) = lower(auth.email())
  or lower(auth.email()) in ('admin1@example.com', 'admin2@example.com')
);

drop policy if exists "entries_update_own_or_admin" on public.entries;
create policy "entries_update_own_or_admin"
on public.entries
for update
to authenticated
using (
  lower(author) = lower(auth.email())
  or lower(auth.email()) in ('admin1@example.com', 'admin2@example.com')
)
with check (
  lower(author) = lower(auth.email())
  or lower(auth.email()) in ('admin1@example.com', 'admin2@example.com')
);
