-- ============================================================
-- AI Web Studio – Supabase Database Schema
-- Chạy file này trong Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: projects
-- ============================================================
create table if not exists public.projects (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  title           text not null,
  description     text,
  project_type    text,
  budget          text,
  deadline        text,
  status          text not null default 'pending'
                  check (status in ('pending','quoted','signed','paid')),
  quote_data      jsonb,
  total_price     numeric(15,2),
  signature_data  text,
  signed_at       timestamptz,
  stripe_session_id text,
  paid_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Row Level Security
alter table public.projects enable row level security;

-- Users can only read/write their own projects
create policy "Users manage own projects"
  on public.projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role can update (for Edge Functions)
create policy "Service role full access"
  on public.projects
  for all
  to service_role
  using (true)
  with check (true);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- TABLE: contact_messages
-- ============================================================
create table if not exists public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  lang       text default 'vi',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone can insert (public contact form)
create policy "Anyone can insert contact"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

-- Only service role can read
create policy "Service role reads contact"
  on public.contact_messages
  for select
  to service_role
  using (true);

-- ============================================================
-- TABLE: user_profiles (optional – extended user info)
-- ============================================================
create table if not exists public.user_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  company    text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users manage own profile"
  on public.user_profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
