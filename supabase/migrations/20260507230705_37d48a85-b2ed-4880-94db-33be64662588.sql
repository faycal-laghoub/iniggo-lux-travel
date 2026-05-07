-- Listing type enum
create type public.listing_type as enum ('stay', 'experience', 'activity', 'tour', 'package');
create type public.listing_status as enum ('draft', 'published', 'archived');
create type public.booking_status as enum ('pending', 'confirmed', 'declined', 'cancelled', 'completed');
create type public.quote_status as enum ('open', 'responded', 'accepted', 'declined', 'closed');

-- LISTINGS
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type listing_type not null default 'stay',
  title text not null,
  description text,
  location text,
  country text,
  price numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  cover_url text,
  images text[] default '{}',
  tags text[] default '{}',
  rating numeric(2,1),
  status listing_status not null default 'draft',
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.listings(owner_id);
create index on public.listings(status);

alter table public.listings enable row level security;

create policy "Published listings viewable by all"
  on public.listings for select
  using (status = 'published' or owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Owners insert own listings"
  on public.listings for insert to authenticated
  with check (owner_id = auth.uid());

create policy "Owners update own listings"
  on public.listings for update to authenticated
  using (owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Owners delete own listings"
  on public.listings for delete to authenticated
  using (owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create trigger listings_touch before update on public.listings
  for each row execute function public.touch_updated_at();

-- BOOKINGS
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  traveler_id uuid not null references auth.users(id) on delete cascade,
  check_in date,
  check_out date,
  travelers integer not null default 1,
  total_price numeric(10,2) not null default 0,
  currency text not null default 'EUR',
  status booking_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.bookings(owner_id);
create index on public.bookings(traveler_id);
create index on public.bookings(listing_id);

alter table public.bookings enable row level security;

create policy "Traveler or owner can view booking"
  on public.bookings for select to authenticated
  using (traveler_id = auth.uid() or owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Traveler can create booking"
  on public.bookings for insert to authenticated
  with check (traveler_id = auth.uid());

create policy "Owner or traveler can update booking"
  on public.bookings for update to authenticated
  using (owner_id = auth.uid() or traveler_id = auth.uid() or has_role(auth.uid(), 'admin'));

create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- QUOTE REQUESTS
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null references auth.users(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  destination text,
  start_date date,
  end_date date,
  travelers integer not null default 1,
  budget numeric(10,2),
  currency text not null default 'EUR',
  message text,
  response text,
  quoted_price numeric(10,2),
  status quote_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.quote_requests(owner_id);
create index on public.quote_requests(traveler_id);

alter table public.quote_requests enable row level security;

create policy "Traveler or owner view quote"
  on public.quote_requests for select to authenticated
  using (traveler_id = auth.uid() or owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Traveler create quote"
  on public.quote_requests for insert to authenticated
  with check (traveler_id = auth.uid());

create policy "Owner or traveler update quote"
  on public.quote_requests for update to authenticated
  using (owner_id = auth.uid() or traveler_id = auth.uid() or has_role(auth.uid(), 'admin'));

create trigger quotes_touch before update on public.quote_requests
  for each row execute function public.touch_updated_at();