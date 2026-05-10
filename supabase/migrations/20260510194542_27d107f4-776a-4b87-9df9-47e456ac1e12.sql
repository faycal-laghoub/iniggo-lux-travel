
-- Attach existing guard trigger functions as BEFORE UPDATE triggers
DROP TRIGGER IF EXISTS bookings_guard_update_trg ON public.bookings;
CREATE TRIGGER bookings_guard_update_trg
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_guard_update();

DROP TRIGGER IF EXISTS payments_guard_update_trg ON public.payments;
CREATE TRIGGER payments_guard_update_trg
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.payments_guard_update();

DROP TRIGGER IF EXISTS quote_requests_guard_update_trg ON public.quote_requests;
CREATE TRIGGER quote_requests_guard_update_trg
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.quote_requests_guard_update();

-- Attach booking notification trigger if missing
DROP TRIGGER IF EXISTS notify_booking_trg ON public.bookings;
CREATE TRIGGER notify_booking_trg
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_booking();

-- Payments: remove user-side write access. Only service role (server functions) may insert/update.
DROP POLICY IF EXISTS "Traveler create payment" ON public.payments;
DROP POLICY IF EXISTS "Owner or traveler update payment" ON public.payments;

-- Allow admins to update payments via the API for support/refund actions
CREATE POLICY "Admins update payments"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Quotes: ensure owner_id is a real vendor (agency or provider role)
DROP POLICY IF EXISTS "Traveler create quote" ON public.quote_requests;
CREATE POLICY "Traveler create quote"
  ON public.quote_requests FOR INSERT TO authenticated
  WITH CHECK (
    traveler_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = quote_requests.owner_id
          AND role IN ('agency'::app_role, 'provider'::app_role)
      )
      OR EXISTS (
        SELECT 1 FROM public.listings
        WHERE listings.owner_id = quote_requests.owner_id
      )
    )
  );
