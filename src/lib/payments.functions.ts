import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  bookingId: z.string().uuid(),
  paymentMethod: z.enum(["card", "stripe_link"]),
});

export const createPaymentIntent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Fetch booking + listing using service role so we have canonical values
    const { data: booking, error: bErr } = await supabaseAdmin
      .from("bookings")
      .select("id, traveler_id, owner_id, listing_id, currency, check_in, check_out, travelers, commission_rate")
      .eq("id", data.bookingId)
      .maybeSingle();

    if (bErr) throw new Error(bErr.message);
    if (!booking) throw new Error("Booking not found");
    if (booking.traveler_id !== userId) throw new Error("Not authorized for this booking");

    const { data: listing, error: lErr } = await supabaseAdmin
      .from("listings")
      .select("id, owner_id, price, currency")
      .eq("id", booking.listing_id)
      .maybeSingle();

    if (lErr) throw new Error(lErr.message);
    if (!listing) throw new Error("Listing not found");
    if (listing.owner_id !== booking.owner_id) throw new Error("Booking/listing mismatch");

    // Server-side canonical price: listing.price * travelers * nights (min 1)
    const nights =
      booking.check_in && booking.check_out
        ? Math.max(
            1,
            Math.ceil(
              (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 1;
    const travelers = Math.max(1, Number(booking.travelers || 1));
    const unitPrice = Number(listing.price || 0);
    const amount = +(unitPrice * travelers * nights).toFixed(2);

    // Fixed platform commission rate (server-controlled, ignore client value)
    const rate = 0.12;
    const platformFee = +(amount * rate).toFixed(2);
    const vendorEarnings = +(amount - platformFee).toFixed(2);
    const currency = listing.currency || booking.currency || "EUR";

    // Sync the booking to the canonical computed total so summary stays consistent
    await supabaseAdmin
      .from("bookings")
      .update({ total_price: amount, commission_rate: rate, currency })
      .eq("id", booking.id);

    const { data: payment, error: pErr } = await supabaseAdmin
      .from("payments")
      .insert({
        booking_id: booking.id,
        traveler_id: booking.traveler_id,
        owner_id: booking.owner_id,
        amount,
        currency,
        platform_fee: platformFee,
        vendor_earnings: vendorEarnings,
        status: "pending",
        payment_method: data.paymentMethod,
      })
      .select("id, amount, currency")
      .single();

    if (pErr) throw new Error(pErr.message);
    return { paymentId: payment.id, amount: payment.amount, currency: payment.currency };
  });
