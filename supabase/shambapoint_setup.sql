-- ══════════════════════════════════════════════════════════════════
-- ShambaPoint — Complete Database Setup (run once in SQL Editor)
-- Dashboard: https://supabase.com/dashboard/project/hwhebeixeflsdshmgowc/sql/new
-- ══════════════════════════════════════════════════════════════════

-- 1. HELPER: auto-set updated_at on any row update
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. PROFILES  (one row per Supabase Auth user)
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  phone        text unique,
  county       text,
  role         text not null default 'buyer'
               check (role in ('farmer','buyer','logistics','admin')),
  status       text not null default 'active'
               check (status in ('active','suspended','pending')),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3. PRODUCTS  (crop listings by farmers)
create table if not exists public.products (
  id            bigint generated always as identity primary key,
  farmer_id     uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(12,2) not null check (price >= 0),
  quantity      text not null,
  unit          text not null default 'kg',
  county        text,
  harvest_date  date,
  category      text,
  image_url     text,
  status        text not null default 'available'
                check (status in ('available','sold_out','pending','removed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 4. ORDERS
create table if not exists public.orders (
  id               bigint generated always as identity primary key,
  buyer_id         uuid not null references public.profiles(id),
  product_id       bigint not null references public.products(id),
  farmer_id        uuid not null references public.profiles(id),
  quantity_ordered text not null,
  total_amount     numeric(12,2) not null check (total_amount >= 0),
  payment_status   text not null default 'pending'
                   check (payment_status in ('pending','paid','failed','refunded')),
  order_status     text not null default 'pending'
                   check (order_status in ('pending','confirmed','in_transit','delivered','cancelled')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 5. DELIVERIES
create table if not exists public.deliveries (
  id                bigint generated always as identity primary key,
  order_id          bigint not null references public.orders(id) on delete cascade,
  driver_id         uuid references public.profiles(id),
  pickup_location   text,
  dropoff_location  text,
  pickup_county     text,
  dropoff_county    text,
  vehicle_type      text,
  vehicle_plate     text,
  status            text not null default 'pending'
                    check (status in ('pending','accepted','preparing','collected','in_transit','delivered','cancelled')),
  scheduled_date    date,
  estimated_cost    numeric(12,2),
  tracking_notes    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
drop trigger if exists deliveries_updated_at on public.deliveries;
create trigger deliveries_updated_at
  before update on public.deliveries
  for each row execute function public.set_updated_at();

-- 6. WALLET TRANSACTIONS
create table if not exists public.wallet_transactions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles(id),
  type          text not null check (type in ('credit','debit','withdrawal','transfer','refund')),
  amount        numeric(12,2) not null check (amount > 0),
  balance_after numeric(12,2),
  reference     text,
  description   text,
  mpesa_code    text,
  status        text not null default 'completed'
                check (status in ('pending','completed','failed')),
  created_at    timestamptz not null default now()
);

-- 7. MESSAGES
create table if not exists public.messages (
  id           bigint generated always as identity primary key,
  sender_id    uuid not null references public.profiles(id),
  receiver_id  uuid not null references public.profiles(id),
  content      text not null,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 8. REVIEWS
create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  reviewer_id uuid not null references public.profiles(id),
  target_id   uuid not null references public.profiles(id),
  order_id    bigint references public.orders(id),
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (reviewer_id, order_id)
);

-- 9. SUPPORT TICKETS
create table if not exists public.support_tickets (
  id           bigint generated always as identity primary key,
  user_id      uuid references public.profiles(id),
  ticket_ref   text not null unique,
  name         text not null,
  email        text not null,
  phone        text,
  category     text not null,
  message      text not null,
  status       text not null default 'open'
               check (status in ('open','in_progress','resolved','closed')),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- 10. PERFORMANCE INDEXES
create index if not exists idx_products_farmer_id   on public.products(farmer_id);
create index if not exists idx_products_status      on public.products(status);
create index if not exists idx_products_county      on public.products(county);
create index if not exists idx_orders_buyer_id      on public.orders(buyer_id);
create index if not exists idx_orders_farmer_id     on public.orders(farmer_id);
create index if not exists idx_orders_product_id    on public.orders(product_id);
create index if not exists idx_deliveries_driver_id on public.deliveries(driver_id);
create index if not exists idx_deliveries_order_id  on public.deliveries(order_id);
create index if not exists idx_wallet_user_id       on public.wallet_transactions(user_id);
create index if not exists idx_messages_receiver    on public.messages(receiver_id);
create index if not exists idx_reviews_target       on public.reviews(target_id);

-- 11. AUTH TRIGGER  (auto-creates profile when user signs up)
create or replace function public.handle_new_user()
returns trigger language plpgsql security invoker
set search_path = '' as $$
begin
  insert into public.profiles (id, name, phone, county, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'county',
    coalesce(lower(new.raw_user_meta_data->>'role'), 'buyer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 12. ROW LEVEL SECURITY
alter table public.profiles            enable row level security;
alter table public.products            enable row level security;
alter table public.orders              enable row level security;
alter table public.deliveries          enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.messages            enable row level security;
alter table public.reviews             enable row level security;
alter table public.support_tickets     enable row level security;

-- profiles
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated using (true);
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- products (public read, farmer write)
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products for select using (true);
drop policy if exists "products_insert" on public.products;
create policy "products_insert" on public.products for insert to authenticated with check ((select auth.uid()) = farmer_id);
drop policy if exists "products_update" on public.products;
create policy "products_update" on public.products for update to authenticated
  using ((select auth.uid()) = farmer_id) with check ((select auth.uid()) = farmer_id);
drop policy if exists "products_delete" on public.products;
create policy "products_delete" on public.products for delete to authenticated using ((select auth.uid()) = farmer_id);

-- orders (buyer + farmer see their own)
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select to authenticated
  using ((select auth.uid()) = buyer_id or (select auth.uid()) = farmer_id);
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert to authenticated with check ((select auth.uid()) = buyer_id);
drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders for update to authenticated
  using ((select auth.uid()) = buyer_id or (select auth.uid()) = farmer_id)
  with check ((select auth.uid()) = buyer_id or (select auth.uid()) = farmer_id);

-- deliveries
drop policy if exists "deliveries_select" on public.deliveries;
create policy "deliveries_select" on public.deliveries for select to authenticated
  using (
    (select auth.uid()) = driver_id or
    exists (select 1 from public.orders o where o.id = order_id and
      ((select auth.uid()) = o.buyer_id or (select auth.uid()) = o.farmer_id))
  );
drop policy if exists "deliveries_insert" on public.deliveries;
create policy "deliveries_insert" on public.deliveries for insert to authenticated with check (true);
drop policy if exists "deliveries_update" on public.deliveries;
create policy "deliveries_update" on public.deliveries for update to authenticated
  using ((select auth.uid()) = driver_id) with check ((select auth.uid()) = driver_id);

-- wallet
drop policy if exists "wallet_select" on public.wallet_transactions;
create policy "wallet_select" on public.wallet_transactions for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "wallet_insert" on public.wallet_transactions;
create policy "wallet_insert" on public.wallet_transactions for insert to authenticated with check ((select auth.uid()) = user_id);

-- messages
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select to authenticated
  using ((select auth.uid()) = sender_id or (select auth.uid()) = receiver_id);
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert to authenticated with check ((select auth.uid()) = sender_id);

-- reviews
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select" on public.reviews for select to authenticated using (true);
drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert" on public.reviews for insert to authenticated with check ((select auth.uid()) = reviewer_id);

-- support tickets (public submit, own read)
drop policy if exists "tickets_insert" on public.support_tickets;
create policy "tickets_insert" on public.support_tickets for insert with check (true);
drop policy if exists "tickets_select" on public.support_tickets;
create policy "tickets_select" on public.support_tickets for select to authenticated using ((select auth.uid()) = user_id);

-- 13. GRANTS
grant select on public.products to anon;
grant insert on public.support_tickets to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert, update on public.deliveries to authenticated;
grant select, insert on public.wallet_transactions to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert on public.reviews to authenticated;
grant select, insert on public.support_tickets to authenticated;
grant usage on all sequences in schema public to authenticated;
grant usage on all sequences in schema public to anon;

-- ══════════════════════════════════════════════════════════════════
-- DONE — 8 tables created with RLS + indexes + auth trigger + grants
-- Switch Table Editor schema dropdown to "public" to see your tables
-- ══════════════════════════════════════════════════════════════════

