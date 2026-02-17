create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.user_role as enum ('admin', 'store_owner', 'customer');
create type public.store_member_role as enum ('store_owner', 'manager', 'staff');
create type public.product_status as enum ('draft', 'active', 'archived');
create type public.order_status as enum ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email citext unique,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.users on delete cascade,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_members (
  store_id uuid not null references public.stores on delete cascade,
  user_id uuid not null references public.users on delete cascade,
  role public.store_member_role not null default 'store_owner',
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores on delete cascade,
  name text not null,
  slug text not null,
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status public.product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table public.product_categories (
  product_id uuid not null references public.products on delete cascade,
  category_id uuid not null references public.categories on delete cascade,
  primary key (product_id, category_id)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  path text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  sku text not null,
  quantity integer not null default 0,
  reserved integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, sku)
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores on delete cascade,
  user_id uuid references public.users on delete set null,
  email citext not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, email)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores on delete cascade,
  customer_id uuid references public.customers on delete set null,
  order_number text not null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  total numeric(12,2) not null default 0,
  currency text not null default 'USD',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, order_number)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid references public.products on delete set null,
  quantity integer not null default 1,
  unit_price numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  provider text not null default 'stripe',
  status public.payment_status not null default 'pending',
  amount numeric(12,2) not null,
  currency text not null default 'USD',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  raw jsonb,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores on delete cascade,
  owner_id uuid references public.users on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.store_members (user_id);
create index on public.categories (store_id);
create index on public.products (store_id);
create index on public.products (status);
create index on public.product_images (product_id);
create index on public.inventory (product_id);
create index on public.customers (store_id);
create index on public.orders (store_id);
create index on public.order_items (order_id);
create index on public.payments (order_id);
create index on public.subscriptions (store_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_stores
before update on public.stores
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_categories
before update on public.categories
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_products
before update on public.products
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_inventory
before update on public.inventory
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_customers
before update on public.customers
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_orders
before update on public.orders
for each row execute procedure public.set_updated_at();

create trigger set_updated_at_subscriptions
before update on public.subscriptions
for each row execute procedure public.set_updated_at();
