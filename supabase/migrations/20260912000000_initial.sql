-- Mind Over Money initial private data model.
-- Apply with Supabase CLI or the SQL editor. Demo Mode does not require this migration.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  experience text not null default 'Beginner' check (experience in ('Beginner', 'Intermediate')),
  risk_tolerance text not null default 'Conservative' check (risk_tolerance in ('Conservative', 'Moderate', 'Aggressive')),
  risk_score integer not null default 25 check (risk_score between 0 and 100),
  investment_horizon text not null default '5+ years',
  goal text not null default 'Long-term wealth creation',
  literacy_score integer not null default 42 check (literacy_score between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, symbol)
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_symbol text,
  analysis_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.paper_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  starting_balance numeric(14, 2) not null default 100000 check (starting_balance >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.portfolio_transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.paper_portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  amount numeric(14, 2) not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('ADD', 'REMOVE')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.learning_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_lessons text[] not null default '{}',
  best_quiz_score integer not null default 0 check (best_quiz_score between 0 and 10),
  last_quiz_score integer check (last_quiz_score between 0 and 10),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.uploaded_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  storage_path text,
  extracted_text text,
  analysis jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists watchlists_user_id_idx on public.watchlists(user_id);
create index if not exists analyses_user_id_idx on public.analyses(user_id);
create index if not exists portfolio_transactions_portfolio_id_idx on public.portfolio_transactions(portfolio_id);
create index if not exists portfolio_transactions_user_id_idx on public.portfolio_transactions(user_id);
create index if not exists uploaded_reports_user_id_idx on public.uploaded_reports(user_id);

alter table public.profiles enable row level security;
alter table public.watchlists enable row level security;
alter table public.analyses enable row level security;
alter table public.paper_portfolios enable row level security;
alter table public.portfolio_transactions enable row level security;
alter table public.learning_progress enable row level security;
alter table public.uploaded_reports enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "watchlists_own" on public.watchlists;
create policy "watchlists_own" on public.watchlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "analyses_own" on public.analyses;
create policy "analyses_own" on public.analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "paper_portfolios_own" on public.paper_portfolios;
create policy "paper_portfolios_own" on public.paper_portfolios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "portfolio_transactions_own" on public.portfolio_transactions;
create policy "portfolio_transactions_own" on public.portfolio_transactions
  for all
  using (auth.uid() = user_id and exists (select 1 from public.paper_portfolios p where p.id = portfolio_id and p.user_id = auth.uid()))
  with check (auth.uid() = user_id and exists (select 1 from public.paper_portfolios p where p.id = portfolio_id and p.user_id = auth.uid()));

drop policy if exists "learning_progress_own" on public.learning_progress;
create policy "learning_progress_own" on public.learning_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "uploaded_reports_own" on public.uploaded_reports;
create policy "uploaded_reports_own" on public.uploaded_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
