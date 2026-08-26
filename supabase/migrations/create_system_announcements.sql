-- ==============================================================================
-- WARAYFLIX GLOBAL SYSTEM ANNOUNCEMENTS TABLE
-- Run this in your Supabase SQL Editor to enable cross-device maintenance announcements.
-- ==============================================================================

create table if not exists public.system_announcements (
  id text primary key,
  active boolean default true,
  type text default 'maintenance',
  title text,
  message text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.system_announcements enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read system_announcements" on public.system_announcements;
drop policy if exists "Allow public insert/update system_announcements" on public.system_announcements;

-- Allow all visitors (including guest/incognito) to read active announcements
create policy "Allow public read system_announcements"
  on public.system_announcements
  for select
  using (true);

-- Allow updates/inserts for announcements
create policy "Allow public insert/update system_announcements"
  on public.system_announcements
  for all
  using (true)
  with check (true);

