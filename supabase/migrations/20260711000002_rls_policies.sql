-- ShambaPoint — Row Level Security Policies
-- Migration: 20260711000002_rls_policies.sql

-- ──────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ──────────────────────────────────────────────────────────────
alter table public.profiles            enable row level security;
alter table public.products            enable row level security;
alter table public.orders              enable row level security;
alter table public.deliveries          enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.messages            enable row level security;
alter table public.reviews             enable row level security;
alter table public.support_tickets     enable row level security;

-- ──────────────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────────────
-- Any authenticated user can read all profiles (name, county, role visible on marketplace)
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Users can only update their own profile
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- Profile is created automatically via trigger on auth.users insert
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ( (select auth.uid()) = id );

-- ──────────────────────────────────────────────────────────────
-- PRODUCTS
-- ──────────────────────────────────────────────────────────────
-- Everyone (including anonymous visitors) can view available products
create policy "products_select_all"
  on public.products for select
  using (true);

-- Only authenticated farmers can insert their own products
create policy "products_insert_farmer"
  on public.products for insert
  to authenticated
  with check (
    (select auth.uid()) = farmer_id
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'farmer'
    )
  );

-- Farmers can only update their own products
create policy "products_update_farmer"
  on public.products for update
  to authenticated
  using ( (select auth.uid()) = farmer_id )
  with check ( (select auth.uid()) = farmer_id );

-- Farmers can only delete their own products
create policy "products_delete_farmer"
  on public.products for delete
  to authenticated
  using ( (select auth.uid()) = farmer_id );

-- ──────────────────────────────────────────────────────────────
-- ORDERS
-- ──────────────────────────────────────────────────────────────
-- Buyers see their own orders; farmers see orders for their products
create policy "orders_select_parties"
  on public.orders for select
  to authenticated
  using (
    (select auth.uid()) = buyer_id
    or (select auth.uid()) = farmer_id
  );

-- Only authenticated buyers can create orders
create policy "orders_insert_buyer"
  on public.orders for insert
  to authenticated
  with check (
    (select auth.uid()) = buyer_id
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'buyer'
    )
  );

-- Parties involved can update order status
create policy "orders_update_parties"
  on public.orders for update
  to authenticated
  using (
    (select auth.uid()) = buyer_id
    or (select auth.uid()) = farmer_id
  )
  with check (
    (select auth.uid()) = buyer_id
    or (select auth.uid()) = farmer_id
  );

-- ──────────────────────────────────────────────────────────────
-- DELIVERIES
-- ──────────────────────────────────────────────────────────────
-- Driver, buyer, and farmer involved in the order can view deliveries
create policy "deliveries_select_involved"
  on public.deliveries for select
  to authenticated
  using (
    (select auth.uid()) = driver_id
    or exists (
      select 1 from public.orders o
      where o.id = order_id
        and ((select auth.uid()) = o.buyer_id or (select auth.uid()) = o.farmer_id)
    )
  );

-- Logistics users can insert and update their delivery records
create policy "deliveries_insert_logistics"
  on public.deliveries for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role in ('logistics', 'admin')
    )
  );

create policy "deliveries_update_driver"
  on public.deliveries for update
  to authenticated
  using ( (select auth.uid()) = driver_id )
  with check ( (select auth.uid()) = driver_id );

-- ──────────────────────────────────────────────────────────────
-- WALLET TRANSACTIONS
-- ──────────────────────────────────────────────────────────────
-- Users can only see their own transactions
create policy "wallet_select_own"
  on public.wallet_transactions for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- System inserts transactions (no client insert allowed — use a function)
create policy "wallet_insert_own"
  on public.wallet_transactions for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

-- ──────────────────────────────────────────────────────────────
-- MESSAGES
-- ──────────────────────────────────────────────────────────────
-- Sender or receiver can read messages
create policy "messages_select_parties"
  on public.messages for select
  to authenticated
  using (
    (select auth.uid()) = sender_id
    or (select auth.uid()) = receiver_id
  );

-- Any authenticated user can send a message
create policy "messages_insert_sender"
  on public.messages for insert
  to authenticated
  with check ( (select auth.uid()) = sender_id );

-- ──────────────────────────────────────────────────────────────
-- REVIEWS
-- ──────────────────────────────────────────────────────────────
-- All authenticated users can read reviews
create policy "reviews_select_all"
  on public.reviews for select
  to authenticated
  using (true);

-- Reviewer can only insert their own review
create policy "reviews_insert_reviewer"
  on public.reviews for insert
  to authenticated
  with check ( (select auth.uid()) = reviewer_id );

-- Anyone (including unauthenticated) can submit a valid ticket
drop policy if exists "support_tickets_insert_any" on public.support_tickets;
drop policy if exists "tickets_insert" on public.support_tickets;
create policy "support_tickets_insert_any"
  on public.support_tickets for insert
  with check (length(name) > 0 and length(email) > 0 and length(message) > 0);

-- Users can only see their own tickets
create policy "support_tickets_select_own"
  on public.support_tickets for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- ──────────────────────────────────────────────────────────────
-- DATA API GRANTS (expose tables to REST API for authenticated role)
-- ──────────────────────────────────────────────────────────────
grant select on public.products to anon;
grant select, insert, update on public.profiles            to authenticated;
grant select, insert, update, delete on public.products    to authenticated;
grant select, insert, update on public.orders              to authenticated;
grant select, insert, update on public.deliveries          to authenticated;
grant select, insert on public.wallet_transactions         to authenticated;
grant select, insert on public.messages                    to authenticated;
grant select, insert on public.reviews                     to authenticated;
grant insert on public.support_tickets                     to anon;
grant select, insert on public.support_tickets             to authenticated;

-- Grant usage on sequences
grant usage on all sequences in schema public to authenticated;
grant usage on all sequences in schema public to anon;
