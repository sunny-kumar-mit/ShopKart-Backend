-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Extends Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text not null,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CART ITEMS
create table cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products on delete cascade not null,
  quantity integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  total_amount decimal(10,2) not null,
  status text default 'pending', -- pending, paid, shipped, delivered
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Security)

-- Profiles: Public read, User update own
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Products: Public read, Admin write (mocking admin as authenticated for now)
alter table products enable row level security;
create policy "Products are viewable by everyone." on products for select using (true);

-- Cart: User only
alter table cart_items enable row level security;
create policy "Users can view own cart." on cart_items for select using (auth.uid() = user_id);
create policy "Users can insert into own cart." on cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart." on cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart." on cart_items for delete using (auth.uid() = user_id);
