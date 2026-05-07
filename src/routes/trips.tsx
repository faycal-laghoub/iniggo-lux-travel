import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, X } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My Trips — inigGO" },
      { name: "description", content: "Your bookings, upcoming journeys and travel history on inigGO." },
    ],
  }),
  component: TripsPage,
});

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled", "declined"] as const;

function TripsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("all");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("bookings")
      .select("*, listings(title, location, country, cover_url, type)")
      .eq("traveler_id", user.id)
      .order("created_at", { ascending: false });
    setBookings(data ?? []);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user]);

  const cancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Booking cancelled"); refresh(); }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  if (loading || !user) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="pt-28 pb-20 px-6 md:px-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your journeys</p>
          <h1 className="font-display text-4xl md:text-5xl mt-2">My trips</h1>
        </motion.div>

        <div className="flex gap-2 mt-8 overflow-x-auto pb-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.16em] capitalize whitespace-nowrap transition-colors ${
                filter === s ? "bg-ink text-ivory" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid gap-4 mt-6">
          {filtered.map((b) => (
            <motion.div
              key={b.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col md:flex-row"
            >
              <div className="md:w-56 aspect-[16/10] md:aspect-auto bg-muted flex-shrink-0">
                {b.listings?.cover_url && <img src={b.listings.cover_url} alt={b.listings.title} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Badge variant="outline" className="capitalize">{b.listings?.type ?? "trip"}</Badge>
                    <Badge className={`capitalize ${
                      b.status === "confirmed" ? "bg-gold/20 text-ink hover:bg-gold/20" :
                      b.status === "pending" ? "bg-muted text-foreground hover:bg-muted" :
                      b.status === "cancelled" || b.status === "declined" ? "bg-destructive/10 text-destructive hover:bg-destructive/10" :
                      "bg-secondary text-secondary-foreground hover:bg-secondary"
                    }`}>{b.status}</Badge>
                  </div>
                  <h3 className="font-display text-2xl mt-2">{b.listings?.title ?? "Listing"}</h3>
                  {b.listings?.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {b.listings.location}{b.listings.country ? `, ${b.listings.country}` : ""}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.check_in} → {b.check_out}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {b.travelers}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="font-display text-xl">€{Number(b.total_price).toLocaleString()}</span>
                  <div className="flex gap-2">
                    <Link to="/booking/$bookingId" params={{ bookingId: b.id }}>
                      <Button size="sm" variant="outline">Details</Button>
                    </Link>
                    {(b.status === "pending" || b.status === "confirmed") && (
                      <Button size="sm" variant="outline" onClick={() => cancel(b.id)}>
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {!filtered.length && (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center">
              <p className="text-muted-foreground">No trips here yet.</p>
              <Link to="/search"><Button className="mt-4 bg-ink text-ivory hover:bg-ink/90">Discover stays</Button></Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
