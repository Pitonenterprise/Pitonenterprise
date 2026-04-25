-- ============================================================
-- Saree Store — Supabase / PostgreSQL schema
-- Run inside Supabase SQL editor (or psql) to provision tables.
-- The app falls back to in-memory seed data if Supabase isn't
-- configured (DEMO_MODE=true), so this is optional for trying it.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ----------------- Products -----------------
create table if not exists products (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  name            text not null,
  description     text not null default '',
  price_inr       integer not null,
  fabric          text not null,
  color           text not null,
  category        text not null,
  occasion_tags   text[] not null default '{}',
  image_url       text not null,
  gallery_urls    text[] default '{}',
  stock_quantity  integer not null default 0,
  status          text not null default 'active'
                    check (status in ('active','draft','archived')),
  weave_region    text,
  blouse_included boolean default true,
  length_meters   numeric(3,1),
  care            text,
  created_at      timestamptz not null default now()
);

create index if not exists products_category_idx on products(category);
create index if not exists products_fabric_idx on products(fabric);
create index if not exists products_status_idx on products(status);

-- ----------------- Customers / Profiles -----------------
-- Supabase auth.users handles login. Extend with profile data here.
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  default_currency text default 'INR',
  created_at    timestamptz not null default now()
);

-- ----------------- Orders -----------------
create table if not exists orders (
  id                uuid primary key default uuid_generate_v4(),
  display_id        text unique not null,
  customer_id       uuid references auth.users(id),
  customer_email    text not null,
  customer_name     text not null,
  customer_phone    text,
  status            text not null default 'pending'
                      check (status in ('pending','confirmed','shipped','delivered','cancelled','returned')),
  total_inr         integer not null,
  currency          text not null default 'INR',
  total_display     numeric(10,2) not null,
  shipping_address  jsonb not null,
  tracking_number   text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_customer_idx on orders(customer_id);
create index if not exists orders_email_idx on orders(customer_email);
create index if not exists orders_status_idx on orders(status);

create table if not exists order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid not null references products(id),
  product_name  text not null,
  product_slug  text not null,
  image_url     text,
  quantity      integer not null,
  price_inr     integer not null
);

create index if not exists order_items_order_idx on order_items(order_id);

-- ----------------- Returns -----------------
create table if not exists return_requests (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id),
  reason      text not null,
  status      text not null default 'requested'
                check (status in ('requested','approved','received','refunded','rejected')),
  created_at  timestamptz not null default now()
);

-- ----------------- Chat sessions -----------------
create table if not exists chat_sessions (
  id                  uuid primary key default uuid_generate_v4(),
  customer_id         uuid references auth.users(id),
  guest_session_id    text,
  started_at          timestamptz not null default now(),
  last_message_at     timestamptz not null default now(),
  ended_at            timestamptz,
  escalated_to_human  boolean not null default false,
  led_to_purchase     boolean not null default false,
  order_id            uuid references orders(id)
);

create index if not exists chat_sessions_customer_idx on chat_sessions(customer_id);
create index if not exists chat_sessions_guest_idx on chat_sessions(guest_session_id);

create table if not exists chat_messages (
  id                       uuid primary key default uuid_generate_v4(),
  session_id               uuid not null references chat_sessions(id) on delete cascade,
  role                     text not null check (role in ('user','assistant','system','tool')),
  content                  text not null,
  product_ids_recommended  uuid[],
  metadata                 jsonb,
  created_at               timestamptz not null default now()
);

create index if not exists chat_messages_session_idx on chat_messages(session_id);

-- ============================================================
-- Row Level Security (RLS) — enable for production
-- ============================================================
-- alter table profiles enable row level security;
-- alter table orders enable row level security;
-- alter table order_items enable row level security;
-- alter table chat_sessions enable row level security;
-- alter table chat_messages enable row level security;
--
-- Example policy: customers can only read their own orders.
-- create policy "own orders" on orders for select
--   using (customer_id = auth.uid());
