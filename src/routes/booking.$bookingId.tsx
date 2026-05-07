import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/booking/$bookingId")({
  component: BookingConfirmation,
});

function BookingConfirmation() {
  const { bookingId } = Route.useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, listings(title, location, country, cover_url, type)")
        .eq("id", bookingId)
        .maybeSingle();
      setBooking(data);
      setLoading(false);
    })();
  }, [bookingId]);

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
      <div className="pt-28 pb-20 px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-10">
            <div className="inline-flex w-14 h-14 rounded-full bg-gold/20 items-center justify-center mb-4">
              <Check className="h-7 w-7 text-gold" />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Booking received</p>
            <h1 className="font-display text-4xl md:text-5xl mt-3">Thank you</h1>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Your booking request has been sent to the vendor. You'll be notified once it's confirmed (usually within 24h).
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {l?.cover_url && (
              <div className="aspect-[16/9] bg-muted">
                <img src={l.cover_url} alt={l?.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <Badge variant="outline" className="capitalize mb-2">{l?.type}</Badge>
                  <h2 className="font-display text-2xl">{l?.title}</h2>
                  {l?.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {l.location}{l.country ? `, ${l.country}` : ""}</p>}
                </div>
                <Badge className="bg-gold/20 text-ink hover:bg-gold/20 capitalize"><Clock className="h-3 w-3 mr-1" /> {booking.status}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border text-sm">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Check-in</p>
                  <p className="font-medium mt-1">{booking.check_in}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Check-out</p>
                  <p className="font-medium mt-1">{booking.check_out}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Travelers</p>
                  <p className="font-medium mt-1">{booking.travelers}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-2xl">€{Number(booking.total_price).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-8">
            <Link to="/trips"><Button variant="outline">View my trips <ArrowRight className="h-3 w-3 ml-2" /></Button></Link>
            <Link to="/search"><Button className="bg-ink text-ivory hover:bg-ink/90">Continue exploring</Button></Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
