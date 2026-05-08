import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format, differenceInCalendarDays } from "date-fns";
import { Calendar as CalendarIcon, MapPin, Star, Users, ArrowLeft, Check } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/listing/$id")({
  component: ListingDetail,
});

type Listing = {
  id: string;
  owner_id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  country: string | null;
  price: number;
  currency: string;
  cover_url: string | null;
  images: string[] | null;
  tags: string[] | null;
  rating: number | null;
};

function ListingDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [travelers, setTravelers] = useState(2);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      setListing(data as Listing | null);
      setLoading(false);
      // bump views
      if (data) supabase.from("listings").update({ views: ((data as any).views ?? 0) + 1 }).eq("id", id).then(() => {});
    })();
  }, [id]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(1, differenceInCalendarDays(checkOut, checkIn));
  }, [checkIn, checkOut]);

  const total = useMemo(() => (listing ? Number(listing.price) * Math.max(1, nights || 1) : 0), [listing, nights]);

  const book = async () => {
    if (!user) {
      toast.message("Please sign in to book");
      navigate({ to: "/auth" });
      return;
    }
    if (!listing) return;
    if (!checkIn || !checkOut) { toast.error("Pick your dates"); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from("bookings").insert({
      listing_id: listing.id,
      owner_id: listing.owner_id,
      traveler_id: user.id,
      check_in: format(checkIn, "yyyy-MM-dd"),
      check_out: format(checkOut, "yyyy-MM-dd"),
      travelers,
      total_price: total,
      currency: listing.currency,
      notes: notes || null,
      status: "pending",
    }).select("id").single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    navigate({ to: "/checkout/$bookingId", params: { bookingId: data!.id } });
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="pt-32 px-6 max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl">Listing not found</h1>
          <p className="text-muted-foreground mt-2">This listing may have been removed.</p>
          <Link to="/search" className="inline-flex items-center gap-2 mt-6 text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-28 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
        <Link to="/search" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-muted"
        >
          {listing.cover_url ? (
            <img src={listing.cover_url} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ink/20 to-gold/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
          <div className="absolute bottom-6 left-6 text-ivory">
            <Badge className="bg-ivory/90 text-ink capitalize">{listing.type}</Badge>
            <h1 className="font-display text-3xl md:text-5xl mt-3">{listing.title}</h1>
            {listing.location && (
              <p className="flex items-center gap-1.5 mt-2 text-ivory/90">
                <MapPin className="h-4 w-4" /> {listing.location}{listing.country ? `, ${listing.country}` : ""}
              </p>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-10">
          {/* Details */}
          <div>
            <div className="flex items-center gap-4 pb-6 border-b border-border">
              {listing.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-medium">{listing.rating}</span>
                </div>
              )}
              {listing.tags?.map((t) => (
                <Badge key={t} variant="outline">{t}</Badge>
              ))}
            </div>

            {listing.description && (
              <div className="py-8 border-b border-border">
                <h2 className="font-display text-2xl mb-3">About this {listing.type}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            <div className="py-8">
              <h2 className="font-display text-2xl mb-4">What's included</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {["Concierge service", "Curated local guides", "24/7 support", "Flexible cancellation"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-gold" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <span className="font-display text-3xl">€{Number(listing.price).toLocaleString()}</span>
                  <span className="text-muted-foreground"> / night</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start font-normal text-xs", !checkIn && "text-muted-foreground")}>
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {checkIn ? format(checkIn, "MMM d") : "Check-in"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start font-normal text-xs", !checkOut && "text-muted-foreground")}>
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {checkOut ? format(checkOut, "MMM d") : "Check-out"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} disabled={(d) => d < (checkIn ?? new Date())} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="mb-3">
                <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Users className="h-3 w-3" /> Travelers</label>
                <Input type="number" min={1} max={20} value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} />
              </div>

              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-1 block">Special requests</label>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything we should know?" />
              </div>

              {nights > 0 && (
                <div className="space-y-1 text-sm py-3 border-t border-border">
                  <div className="flex justify-between text-muted-foreground">
                    <span>€{listing.price} × {nights} {nights === 1 ? "night" : "nights"}</span>
                    <span>€{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="font-display text-lg">€{total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Button onClick={book} disabled={submitting} className="w-full mt-4 bg-ink text-ivory hover:bg-ink/90 h-11">
                {submitting ? "Submitting…" : user ? "Request to book" : "Sign in to book"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                You won't be charged yet — vendor confirms within 24h.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
