
REVOKE EXECUTE ON FUNCTION public.bookings_guard_update() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.payments_guard_update() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.quote_requests_guard_update() FROM anon, authenticated, public;
