
drop view if exists public.vendor_earnings;
create view public.vendor_earnings
with (security_invoker = true) as
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
