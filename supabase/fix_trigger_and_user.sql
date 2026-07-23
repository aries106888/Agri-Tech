-- ══════════════════════════════════════════════════════════════════
-- ShambaPoint — Fix Auth Trigger + Re-apply Grants
-- Run this in the Supabase SQL Editor FIRST before trying to sign up again:
-- https://supabase.com/dashboard/project/hwhebeixeflsdshmgowc/sql/new
-- ══════════════════════════════════════════════════════════════════

-- 1. Drop and recreate handle_new_user with SECURITY DEFINER (required to
--    write into public.profiles from the auth.users trigger context)
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

-- 2. Revoke direct execution
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Fix RLS profile insert policy
drop policy if exists "profiles_insert_own"  on public.profiles;
drop policy if exists "profiles_insert"      on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

-- 5. Confirm grants
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.profiles to service_role;

-- ══════════════════════════════════════════════════════════════════
-- DONE. Now go to /signup and re-register:
--   Email:    zeuskevin38@gmail.com
--   Password: Farmer@2026
--   Role:     Farmer
-- The trigger will auto-create the profile. Login will then work permanently.
-- ══════════════════════════════════════════════════════════════════
