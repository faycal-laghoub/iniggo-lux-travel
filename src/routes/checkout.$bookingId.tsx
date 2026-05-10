import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, CreditCard, ShieldCheck, Check, MapPin } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { createPaymentIntent } from "@/lib/payments.functions";

export const Route = createFileRoute("/checkout/$bookingId")({
  component: Checkout,
});

function Checkout() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<"card" | "stripe_link">("card");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, listings(title, location, country, cover_url, type)")
        .eq("id", bookingId)
        .eq("traveler_id", user.id)
        .maybeSingle();
      setBooking(data);
      setLoading(false);
    })();
  }, [bookingId, user, authLoading]);

  const totals = useMemo(() => {
    if (!booking) return null;
    const amount = Number(booking.total_price || 0);
    const rate = Number(booking.commission_rate ?? 0.12);
    const platformFee = +(amount * rate).toFixed(2);
    const vendorEarnings = +(amount - platformFee).toFixed(2);
    return { amount, rate, platformFee, vendorEarnings };
  }, [booking]);

  const payIntent = useServerFn(createPaymentIntent);

  async function handlePay() {
    if (!booking || !user) return;
    if (booking.traveler_id !== user.id) {
      toast.error("You are not the traveler for this booking.");
      return;
    }
    setProcessing(true);
    try {
      await payIntent({ data: { bookingId: booking.id, paymentMethod: method } });
      toast.success("Payment intent created", {
        description: "Stripe integration coming soon — booking saved.",
      });
      setTimeout(() => navigate({ to: "/booking/$bookingId", params: { bookingId } }), 600);
    } catch (e: any) {
      toast.error(e.message ?? "Payment failed");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 px-6 text-center">
          <h1 className="font-display text-3xl">Booking not found</h1>
          <Link to="/search" className="text-gold underline mt-4 inline-block">Back to search</Link>
        </div>
      </div>
    );
  }

  const l = booking.listings;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Secure checkout</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2">Complete your booking</h1>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_400px] gap-10 mt-10">
          {/* Payment form */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl mb-4">Payment method</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: "card", label: "Card", icon: CreditCard },
                  { id: "stripe_link", label: "Stripe Link", icon: Lock },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = method === (m.id as any);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as any)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                        active ? "border-gold bg-gold/10" : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{m.label}</span>
                      {active && <Check className="h-3 w-3 ml-auto text-gold" />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 opacity-90">
                <div>
                  <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Card number</Label>
                  <Input placeholder="4242 4242 4242 4242" className="mt-1.5 h-11" disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Expiry</Label>
                    <Input placeholder="MM / YY" className="mt-1.5 h-11" disabled />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">CVC</Label>
                    <Input placeholder="123" className="mt-1.5 h-11" disabled />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
                  <ShieldCheck className="h-3 w-3 text-gold" />
                  Stripe Connect integration coming soon — fields disabled in preview.
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl mb-1">Cancellation</h2>
              <p className="text-sm text-muted-foreground">
                Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.
              </p>
            </section>
          </div>

          {/* Order summary */}
          <aside className="rounded-2xl border border-border bg-card p-6 h-fit md:sticky md:top-24">
            {l?.cover_url && (
              <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-muted">
                <img src={l.cover_url} alt={l?.title} className="w-full h-full object-cover" />
              </div>
            )}
            <Badge variant="outline" className="capitalize mb-2">{l?.type}</Badge>
            <h3 className="font-display text-lg leading-snug">{l?.title}</h3>
            {l?.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {l.location}{l.country ? `, ${l.country}` : ""}
              </p>
            )}

            <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Dates</span><span>{booking.check_in} → {booking.check_out}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Travelers</span><span>{booking.travelers}</span></div>
            </div>

            {totals && (
              <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>€{totals.amount.toLocaleString()}</span></div>
                <div className="flex justify-between text-muted-foreground/80">
                  <span>inigGO service fee ({(totals.rate * 100).toFixed(0)}%)</span>
                  <span>included</span>
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-border">
                  <span className="font-medium">Total</span>
                  <span className="font-display text-2xl">€{totals.amount.toLocaleString()}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handlePay}
              disabled={processing}
              className="w-full mt-5 h-12 bg-ink text-ivory hover:bg-ink/90"
            >
              <Lock className="h-4 w-4 mr-2" />
              {processing ? "Processing…" : `Pay €${Number(booking.total_price).toLocaleString()}`}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Payments are securely processed via Stripe. Your card is not charged in preview mode.
            </p>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
