-- ShambaPoint — Initial Schema
-- Migration: 20260711000001_initial_schema.sql
-- Creates all base tables for the ShambaPoint agri-marketplace platform.

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES (mirrors Supabase Auth users)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text not null,
  phone        text unique,
  county       text,
  role         text not null check (role in ('farmer', 'buyer', 'logistics', 'admin')),
  status       text not null default 'active' check (status in ('active', 'suspended', 'pending')),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'Extended user profile data linked to Supabase Auth.';

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 2. PRODUCTS (crop listings by farmers)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.products (
  id            bigint generated always as identity primary key,
  farmer_id     uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(12, 2) not null check (price >= 0),
  quantity      text not null,
  unit          text not null default 'kg',
  county        text,
  harvest_date  date,
  category      text,
  image_url     text,
  status        text not null default 'available' check (status in ('available', 'sold_out', 'pending', 'removed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.products is 'Crop/produce listings created by farmers.';

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 3. ORDERS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id               bigint generated always as identity primary key,
  buyer_id         uuid not null references public.profiles(id),
  product_id       bigint not null references public.products(id),
  farmer_id        uuid not null references public.profiles(id),
  quantity_ordered text not null,
  total_amount     numeric(12, 2) not null check (total_amount >= 0),
  payment_status   text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status     text not null default 'pending' check (order_status in ('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.orders is 'Buyer purchase orders for farmer listings.';

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 4. DELIVERIES
-- ──────────────────────────────────────────────────────────────
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
  status            text not null default 'pending' check (status in ('pending', 'accepted', 'preparing', 'collected', 'in_transit', 'delivered', 'cancelled')),
  scheduled_date    date,
  estimated_cost    numeric(12, 2),
  tracking_notes    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.deliveries is 'Logistics delivery records linked to orders.';

create trigger deliveries_updated_at
  before update on public.deliveries
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 5. WALLET TRANSACTIONS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.wallet_transactions (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles(id),
  type          text not null check (type in ('credit', 'debit', 'withdrawal', 'transfer', 'refund')),
  amount        numeric(12, 2) not null check (amount > 0),
  balance_after numeric(12, 2),
  reference     text,
  description   text,
  mpesa_code    text,
  status        text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at    timestamptz not null default now()
);

comment on table public.wallet_transactions is 'Financial transaction log for all user wallets.';

-- ──────────────────────────────────────────────────────────────
-- 6. MESSAGES
-- ──────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id           bigint generated always as identity primary key,
  sender_id    uuid not null references public.profiles(id),
  receiver_id  uuid not null references public.profiles(id),
  content      text not null,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on table public.messages is 'Direct messages between platform users.';

-- ──────────────────────────────────────────────────────────────
-- 7. REVIEWS
-- ──────────────────────────────────────────────────────────────
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

comment on table public.reviews is 'Ratings and reviews between buyers and farmers.';

-- ──────────────────────────────────────────────────────────────
-- 8. SUPPORT TICKETS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.support_tickets (
  id           bigint generated always as identity primary key,
  user_id      uuid references public.profiles(id),
  ticket_ref   text not null unique,
  name         text not null,
  email        text not null,
  phone        text,
  category     text not null,
  message      text not null,
  status       text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

comment on table public.support_tickets is 'Customer support tickets from the Help Center.';

-- ──────────────────────────────────────────────────────────────
-- INDEXES for common query patterns
-- ──────────────────────────────────────────────────────────────
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
