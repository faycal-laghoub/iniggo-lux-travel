create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.notifications(user_id, read);

alter table public.notifications enable row level security;

create policy "Users view own notifications" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications
  for update to authenticated using (user_id = auth.uid());
create policy "Users delete own notifications" on public.notifications
  for delete to authenticated using (user_id = auth.uid());
create policy "System insert notifications" on public.notifications
  for insert to authenticated with check (true);

-- Booking notification trigger
create or replace function public.notify_booking()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_title text;
begin
  select title into v_title from public.listings where id = new.listing_id;
  if (TG_OP = 'INSERT') then
    insert into public.notifications (user_id, type, title, body, link)
    values (new.owner_id, 'booking_new', 'New booking request',
      'A traveler booked ' || coalesce(v_title, 'your listing'), '/dashboard');
    insert into public.notifications (user_id, type, title, body, link)
    values (new.traveler_id, 'booking_created', 'Booking submitted',
      'Your booking for ' || coalesce(v_title, 'this listing') || ' is pending confirmation.', '/trips');
  elsif (TG_OP = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.notifications (user_id, type, title, body, link)
    values (new.traveler_id, 'booking_status', 'Booking ' || new.status,
      'Your booking for ' || coalesce(v_title, 'this listing') || ' is now ' || new.status || '.', '/trips');
  end if;
  return new;
end; $$;

create trigger booking_notify_ins
  after insert on public.bookings
  for each row execute function public.notify_booking();

create trigger booking_notify_upd
  after update on public.bookings
  for each row execute function public.notify_booking();

revoke execute on function public.notify_booking() from public, anon, authenticated;