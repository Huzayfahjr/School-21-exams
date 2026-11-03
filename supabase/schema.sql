-- Imtihon Tayyorlov: Supabase schema.
-- Supabase dashboard -> SQL Editor -> New query -> paste all of this -> Run.

create extension if not exists pgcrypto;

-- people who may use /admin.html (add yourself after your first login, see SETUP.md)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- people who may no longer send questions
create table if not exists public.blocked (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

-- questions sent by visitors, waiting for review
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exam text not null check (char_length(exam) <= 60),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  payload jsonb not null,
  author text check (author is null or char_length(author) <= 60),
  admin_note text,
  created_at timestamptz not null default now()
);
create index if not exists submissions_status_idx on public.submissions (status, created_at desc);
create index if not exists submissions_user_idx on public.submissions (user_id, created_at desc);

-- approved questions shown on the site (public read)
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam text not null,
  data jsonb not null,
  submission_id uuid references public.submissions(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists questions_exam_idx on public.questions (exam);

-- helpers (security definer so policies can read admins/blocked safely)
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

create or replace function public.is_blocked() returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from public.blocked where user_id = auth.uid()) $$;

-- limits on every new submission: blocked users, daily limit, text sizes
create or replace function public.check_submission() returns trigger
language plpgsql security definer set search_path = public as
$$
declare
  daily_max constant int := 5;
  n int;
  opts jsonb;
begin
  if exists (select 1 from public.blocked where user_id = new.user_id) then
    raise exception 'blocked';
  end if;
  select count(*) into n from public.submissions
    where user_id = new.user_id and created_at > now() - interval '24 hours';
  if n >= daily_max then
    raise exception 'daily_limit';
  end if;
  if jsonb_typeof(new.payload) <> 'object'
     or char_length(coalesce(new.payload->>'text', '')) not between 5 and 2000
     or char_length(coalesce(new.payload->>'code', '')) > 4000
     or char_length(coalesce(new.payload->>'tables', '')) > 4000
     or char_length(coalesce(new.payload->>'explanation', '')) > 2000 then
    raise exception 'invalid_payload';
  end if;
  opts := new.payload->'options';
  if jsonb_typeof(opts) <> 'array' or jsonb_array_length(opts) <> 4 then
    raise exception 'invalid_payload';
  end if;
  new.status := 'pending';
  new.admin_note := null;
  return new;
end
$$;

drop trigger if exists submissions_check on public.submissions;
create trigger submissions_check before insert on public.submissions
  for each row execute function public.check_submission();

-- row level security
alter table public.admins enable row level security;
alter table public.blocked enable row level security;
alter table public.submissions enable row level security;
alter table public.questions enable row level security;

drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists blocked_admin on public.blocked;
create policy blocked_admin on public.blocked for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists sub_insert on public.submissions;
create policy sub_insert on public.submissions for insert to authenticated
  with check (user_id = auth.uid() and not public.is_blocked());

drop policy if exists sub_select on public.submissions;
create policy sub_select on public.submissions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists sub_update on public.submissions;
create policy sub_update on public.submissions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists sub_delete on public.submissions;
create policy sub_delete on public.submissions for delete to authenticated using (public.is_admin());

drop policy if exists q_read on public.questions;
create policy q_read on public.questions for select to anon, authenticated using (true);

drop policy if exists q_write on public.questions;
create policy q_write on public.questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- explicit privileges (RLS above decides which rows)
grant usage on schema public to anon, authenticated;
grant select on public.questions to anon, authenticated;
grant insert, update, delete on public.questions to authenticated;
grant select, insert, update, delete on public.submissions to authenticated;
grant select on public.admins to authenticated;
grant select, insert, update, delete on public.blocked to authenticated;
revoke all on function public.is_admin() from public;
revoke all on function public.is_blocked() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_blocked() to authenticated;
