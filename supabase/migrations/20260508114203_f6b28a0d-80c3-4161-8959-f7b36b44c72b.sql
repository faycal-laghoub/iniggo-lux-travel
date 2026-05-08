
-- Payment status enum
create type public.payment_status as enum ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled');

-- Add payment fields to bookings
alter table public.bookings
  add column if not exists payment_status public.payment_status not null default 'pending',
  add column if not exists commission_rate numeric not null default 0.12;

-- Payments table
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  traveler_id uuid not null,
  owner_id uuid not null,
  amount numeric not null default 0,
  currency text not null default 'EUR',
  platform_fee numeric not null default 0,
  vendor_earnings numeric not null default 0,
  status public.payment_status not null default 'pending',
  payment_method text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_transfer_id text,
  receipt_url text,
  failure_reason text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_payments_booking on public.payments(booking_id);
create index idx_payments_traveler on public.payments(traveler_id);
create index idx_payments_owner on public.payments(owner_id);

alter table public.payments enable row level security;

create policy "Traveler or owner view payment"
  on public.payments for select to authenticated
  using (traveler_id = auth.uid() or owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create policy "Traveler create payment"
  on public.payments for insert to authenticated
  with check (traveler_id = auth.uid());

create policy "Owner or traveler update payment"
  on public.payments for update to authenticated
  using (traveler_id = auth.uid() or owner_id = auth.uid() or has_role(auth.uid(), 'admin'));

create trigger touch_payments_updated_at
  before update on public.payments
  for each row execute function public.touch_updated_at();

-- Vendor earnings view (aggregates paid payments per vendor)
create or replace view public.vendor_earnings as
select
  owner_id,
  currency,
  count(*) filter (where status = 'paid') as paid_count,
  coalesce(sum(amount) filter (where status = 'paid'), 0) as gross_revenue,
  coalesce(sum(platform_fee) filter (where status = 'paid'), 0) as total_fees,
  coalesce(sum(vendor_earnings) filter (where status = 'paid'), 0) as net_earnings,
  coalesce(sum(amount) filter (where status = 'pending'), 0) as pending_revenue
from public.payments
group by owner_id, currency;
