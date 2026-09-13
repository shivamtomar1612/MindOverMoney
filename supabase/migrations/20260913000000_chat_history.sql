-- Persistent Mind Over Money AI conversations for authenticated users.

create extension if not exists pgcrypto;

create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists chat_conversations_user_updated_idx on public.chat_conversations(user_id, updated_at desc);
create index if not exists chat_messages_conversation_created_idx on public.chat_messages(conversation_id, created_at);
create index if not exists chat_messages_user_id_idx on public.chat_messages(user_id);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "chat_conversations_own" on public.chat_conversations;
create policy "chat_conversations_own" on public.chat_conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "chat_messages_own" on public.chat_messages;
create policy "chat_messages_own" on public.chat_messages
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.chat_conversations conversation
      where conversation.id = conversation_id and conversation.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.chat_conversations conversation
      where conversation.id = conversation_id and conversation.user_id = auth.uid()
    )
  );
