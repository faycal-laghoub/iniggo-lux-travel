
-- Quote requests INSERT validation: owner_id must reference a real vendor
DROP POLICY IF EXISTS "Traveler create quote" ON public.quote_requests;
CREATE POLICY "Traveler create quote"
ON public.quote_requests FOR INSERT TO authenticated
WITH CHECK (
  traveler_id = auth.uid()
  AND EXISTS (SELECT 1 FROM public.listings WHERE owner_id = quote_requests.owner_id)
);

-- Trigger: prevent non-admins from changing immutable / privileged booking fields
CREATE OR REPLACE FUNCTION public.bookings_guard_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.owner_id      IS DISTINCT FROM OLD.owner_id
  OR NEW.traveler_id   IS DISTINCT FROM OLD.traveler_id
  OR NEW.listing_id    IS DISTINCT FROM OLD.listing_id
  OR NEW.total_price   IS DISTINCT FROM OLD.total_price
  OR NEW.commission_rate IS DISTINCT FROM OLD.commission_rate
  OR NEW.currency      IS DISTINCT FROM OLD.currency THEN
    RAISE EXCEPTION 'Cannot modify immutable booking fields';
  END IF;
  -- payment_status only owner or admin (admin handled above)
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND auth.uid() <> OLD.owner_id THEN
    RAISE EXCEPTION 'Only the vendor can change payment_status';
  END IF;
  -- status: traveler may only set it to 'cancelled'; owner can set anything else
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF auth.uid() = OLD.traveler_id AND auth.uid() <> OLD.owner_id AND NEW.status::text <> 'cancelled' THEN
      RAISE EXCEPTION 'Travelers can only cancel their booking';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bookings_guard_update ON public.bookings;
CREATE TRIGGER bookings_guard_update BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.bookings_guard_update();

-- Trigger: prevent non-admins from changing financial / Stripe fields on payments
CREATE OR REPLACE FUNCTION public.payments_guard_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.booking_id  IS DISTINCT FROM OLD.booking_id
  OR NEW.traveler_id IS DISTINCT FROM OLD.traveler_id
  OR NEW.owner_id    IS DISTINCT FROM OLD.owner_id
  OR NEW.amount      IS DISTINCT FROM OLD.amount
  OR NEW.currency    IS DISTINCT FROM OLD.currency
  OR NEW.platform_fee IS DISTINCT FROM OLD.platform_fee
  OR NEW.vendor_earnings IS DISTINCT FROM OLD.vendor_earnings
  OR NEW.status      IS DISTINCT FROM OLD.status
  OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
  OR NEW.stripe_charge_id   IS DISTINCT FROM OLD.stripe_charge_id
  OR NEW.stripe_transfer_id IS DISTINCT FROM OLD.stripe_transfer_id
  OR NEW.paid_at     IS DISTINCT FROM OLD.paid_at
  OR NEW.refunded_at IS DISTINCT FROM OLD.refunded_at
  OR NEW.receipt_url IS DISTINCT FROM OLD.receipt_url
  OR NEW.failure_reason IS DISTINCT FROM OLD.failure_reason THEN
    RAISE EXCEPTION 'Payment financial fields are server-managed and cannot be modified by users';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS payments_guard_update ON public.payments;
CREATE TRIGGER payments_guard_update BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.payments_guard_update();

-- Trigger: enforce per-role column ownership on quote_requests
CREATE OR REPLACE FUNCTION public.quote_requests_guard_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_traveler boolean := auth.uid() = OLD.traveler_id;
  is_owner    boolean := auth.uid() = OLD.owner_id;
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.traveler_id IS DISTINCT FROM OLD.traveler_id
  OR NEW.owner_id    IS DISTINCT FROM OLD.owner_id
  OR NEW.currency    IS DISTINCT FROM OLD.currency THEN
    RAISE EXCEPTION 'Cannot modify immutable quote fields';
  END IF;
  -- Vendor-only fields
  IF (NEW.quoted_price IS DISTINCT FROM OLD.quoted_price
      OR NEW.response  IS DISTINCT FROM OLD.response
      OR NEW.status    IS DISTINCT FROM OLD.status)
     AND NOT is_owner THEN
    RAISE EXCEPTION 'Only the vendor can update quoted_price, response, or status';
  END IF;
  -- Traveler-only fields
  IF (NEW.message     IS DISTINCT FROM OLD.message
      OR NEW.budget   IS DISTINCT FROM OLD.budget
      OR NEW.destination IS DISTINCT FROM OLD.destination
      OR NEW.start_date IS DISTINCT FROM OLD.start_date
      OR NEW.end_date IS DISTINCT FROM OLD.end_date
      OR NEW.travelers IS DISTINCT FROM OLD.travelers)
     AND NOT is_traveler THEN
    RAISE EXCEPTION 'Only the traveler can update request details';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS quote_requests_guard_update ON public.quote_requests;
CREATE TRIGGER quote_requests_guard_update BEFORE UPDATE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.quote_requests_guard_update();
