-- ShambaPoint — Auth Trigger
-- Migration: 20260711000003_auth_trigger.sql
-- Automatically creates a profile row whenever a new Supabase Auth user signs up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone, county, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'county',
    coalesce(
      lower(new.raw_user_meta_data->>'role'),
      'buyer'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Drop existing trigger if present then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
