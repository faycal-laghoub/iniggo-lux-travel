
-- 1. Restrict profiles SELECT to self only (phone exposure)
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON public.profiles;
CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- 2. Bookings INSERT must validate owner_id matches the listing owner
DROP POLICY IF EXISTS "Traveler can create booking" ON public.bookings;
CREATE POLICY "Traveler can create booking"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (
  traveler_id = auth.uid()
  AND owner_id = (SELECT owner_id FROM public.listings WHERE id = listing_id)
);

-- 3. Payments INSERT must validate owner_id matches the booking owner
DROP POLICY IF EXISTS "Traveler create payment" ON public.payments;
CREATE POLICY "Traveler create payment"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (
  traveler_id = auth.uid()
  AND owner_id = (SELECT owner_id FROM public.bookings WHERE id = booking_id)
  AND traveler_id = (SELECT traveler_id FROM public.bookings WHERE id = booking_id)
);

-- 4. Remove client-side notification inserts; only server-side (service role / SECURITY DEFINER trigger) may insert
DROP POLICY IF EXISTS "Users insert own notifications" ON public.notifications;
