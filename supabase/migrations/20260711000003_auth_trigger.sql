-- ShambaPoint — Auth Trigger
-- Migration: 20260711000003_auth_trigger.sql
-- Automatically creates a profile row whenever a new Supabase Auth user signs up.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer                      -- critical: trigger runs as superuser
set search_path = ''
as $$
declare
  v_name   text;
  v_phone  text;
  v_county text;
  v_role   text;
begin
  v_name   := coalesce(nullif(trim(new.raw_user_meta_data->>'name'),   ''), split_part(new.email, '@', 1));
  v_phone  := nullif(trim(new.raw_user_meta_data->>'phone'),  '');
  v_county := nullif(trim(new.raw_user_meta_data->>'county'), '');
  v_role   := coalesce(lower(nullif(trim(new.raw_user_meta_data->>'role'), '')), 'buyer');

  if v_role not in ('farmer', 'buyer', 'logistics', 'admin') then
    v_role := 'buyer';
  end if;

  insert into public.profiles (id, name, phone, county, role)
  values (new.id, v_name, v_phone, v_county, v_role)
  on conflict (id) do update set
    name       = excluded.name,
    phone      = coalesce(excluded.phone, public.profiles.phone),
    county     = coalesce(excluded.county, public.profiles.county),
    role       = excluded.role,
    updated_at = now();

  return new;
exception when others then
  raise warning 'handle_new_user: % - %', sqlstate, sqlerrm;
  return new;
end;
$$;

-- Drop existing trigger if present then recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
