import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  MessageSquareQuote,
  Plus,
  TrendingUp,
  Eye,
  Wallet,
  Users,
  Check,
  X,
  Pencil,
  Trash2,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Vendor Dashboard — inigGO" },
      { name: "description", content: "Manage listings, bookings, quotes and earnings on inigGO." },
      { property: "og:title", content: "Vendor Dashboard — inigGO" },
      { property: "og:description", content: "Premium marketplace control for travel agencies and providers." },
    ],
  }),
  component: DashboardPage,
});

type Tab = "overview" | "listings" | "new" | "bookings" | "quotes";

type Listing = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  location: string | null;
  country: string | null;
  price: number;
  currency: string;
  cover_url: string | null;
  tags: string[] | null;
  status: string;
  views: number;
  created_at: string;
};

type Booking = {
  id: string;
  listing_id: string;
  traveler_id: string;
  check_in: string | null;
  check_out: string | null;
  travelers: number;
  total_price: number;
  currency: string;
  status: string;
  notes: string | null;
  created_at: string;
  listings?: { title: string } | null;
};

type Quote = {
  id: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number | null;
  currency: string;
  message: string | null;
  response: string | null;
  quoted_price: number | null;
  status: string;
  created_at: string;
};

const navItems: { tab: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "listings", label: "Listings", icon: Building2 },
  { tab: "new", label: "New listing", icon: Plus },
  { tab: "bookings", label: "Bookings", icon: CalendarCheck },
  { tab: "quotes", label: "Quote requests", icon: MessageSquareQuote },
];

function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const refresh = async () => {
    if (!user) return;
    const [l, b, q] = await Promise.all([
      supabase.from("listings").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabase.from("bookings").select("*, listings(title)").eq("owner_id", user.id).order("created_at", { ascending: false }),
      supabase.from("quote_requests").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (l.data) setListings(l.data as Listing[]);
    if (b.data) setBookings(b.data as Booking[]);
    if (q.data) setQuotes(q.data as Quote[]);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(mobileOpen || true) && (
            <aside
              className={`${mobileOpen ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "-translate-x-full"} md:static md:translate-x-0 transition-transform w-64 bg-ink text-ivory min-h-screen p-6 flex flex-col`}
            >
              <Link to="/" className="font-display text-2xl tracking-tight mb-10">
                inig<span className="text-gold">GO</span>
              </Link>
              <nav className="flex-1 space-y-1">
                {navItems.map((n) => {
                  const Icon = n.icon;
                  const active = tab === n.tab;
                  return (
                    <button
                      key={n.tab}
                      onClick={() => { setTab(n.tab); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
                        active ? "bg-gold text-ink font-medium" : "text-ivory/70 hover:bg-white/5 hover:text-ivory"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {n.label}
                    </button>
                  );
                })}
              </nav>
              <div className="pt-6 border-t border-white/10 space-y-2">
                <Link to="/account" className="block text-xs uppercase tracking-[0.18em] text-ivory/60 hover:text-gold px-4 py-2">
                  Account
                </Link>
                <button
                  onClick={() => signOut().then(() => navigate({ to: "/" }))}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ivory/60 hover:text-gold"
                >
                  <LogOut className="h-3 w-3" /> Sign out
                </button>
              </div>
            </aside>
          )}
        </AnimatePresence>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <header className="md:hidden flex items-center justify-between p-4 border-b border-border">
            <button onClick={() => setMobileOpen((o) => !o)} className="p-2"><Menu /></button>
            <Link to="/" className="font-display text-lg">inig<span className="text-gold">GO</span></Link>
            <div className="w-9" />
          </header>

          <div className="px-6 md:px-10 py-8 md:py-12 max-w-6xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "overview" && <Overview listings={listings} bookings={bookings} quotes={quotes} />}
                {tab === "listings" && <ListingsTab listings={listings} onChanged={refresh} onNew={() => setTab("new")} />}
                {tab === "new" && <NewListingForm onCreated={() => { refresh(); setTab("listings"); }} />}
                {tab === "bookings" && <BookingsTab bookings={bookings} onChanged={refresh} />}
                {tab === "quotes" && <QuotesTab quotes={quotes} onChanged={refresh} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function Overview({ listings, bookings, quotes }: { listings: Listing[]; bookings: Booking[]; quotes: Quote[] }) {
  const earnings = useMemo(
    () => bookings.filter((b) => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + Number(b.total_price), 0),
    [bookings]
  );
  const pending = bookings.filter((b) => b.status === "pending").length;
  const views = listings.reduce((s, l) => s + l.views, 0);
  const openQuotes = quotes.filter((q) => q.status === "open").length;

  const stats = [
    { label: "Earnings", value: `€${earnings.toLocaleString()}`, icon: Wallet },
    { label: "Total bookings", value: bookings.length, icon: CalendarCheck },
    { label: "Pending requests", value: pending, icon: Users },
    { label: "Listing views", value: views, icon: Eye },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
        <h1 className="font-display text-4xl md:text-5xl mt-2">Welcome back</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{s.label}</span>
                <Icon className="h-4 w-4 text-gold" />
              </div>
              <div className="mt-3 font-display text-3xl">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Recent bookings</h2>
            <TrendingUp className="h-4 w-4 text-gold" />
          </div>
          <ul className="divide-y divide-border">
            {bookings.slice(0, 5).map((b) => (
              <li key={b.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{b.listings?.title ?? "Listing"}</div>
                  <div className="text-muted-foreground text-xs">{b.travelers} travelers · €{b.total_price}</div>
                </div>
                <Badge variant="outline" className="capitalize">{b.status}</Badge>
              </li>
            ))}
            {!bookings.length && <li className="py-6 text-sm text-muted-foreground">No bookings yet.</li>}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl mb-4">Open quote requests <span className="text-gold">({openQuotes})</span></h2>
          <ul className="divide-y divide-border">
            {quotes.slice(0, 5).map((q) => (
              <li key={q.id} className="py-3 text-sm">
                <div className="font-medium">{q.destination ?? "Custom trip"}</div>
                <div className="text-muted-foreground text-xs line-clamp-1">{q.message}</div>
              </li>
            ))}
            {!quotes.length && <li className="py-6 text-sm text-muted-foreground">No quote requests yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ---------------- LISTINGS ---------------- */
function ListingsTab({ listings, onChanged, onNew }: { listings: Listing[]; onChanged: () => void; onNew: () => void }) {
  const [editing, setEditing] = useState<Listing | null>(null);

  const remove = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Listing deleted"); onChanged(); }
  };

  const togglePublish = async (l: Listing) => {
    const next = l.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("listings").update({ status: next }).eq("id", l.id);
    if (error) toast.error(error.message); else { toast.success(next === "published" ? "Published" : "Unpublished"); onChanged(); }
  };

  if (editing) return <EditListingForm listing={editing} onDone={() => { setEditing(null); onChanged(); }} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Inventory</p>
          <h1 className="font-display text-4xl mt-2">Listings</h1>
        </div>
        <Button onClick={onNew} className="bg-ink text-ivory hover:bg-ink/90"><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>

      <div className="grid gap-4">
        {listings.map((l) => (
          <div key={l.id} className="rounded-xl border border-border bg-card p-5 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-32 aspect-video md:aspect-square rounded-lg bg-muted overflow-hidden flex-shrink-0">
              {l.cover_url && <img src={l.cover_url} alt={l.title} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize">{l.type}</Badge>
                <Badge variant={l.status === "published" ? "default" : "secondary"} className="capitalize">{l.status}</Badge>
              </div>
              <h3 className="font-display text-xl mt-2">{l.title}</h3>
              <p className="text-sm text-muted-foreground">{l.location ?? ""}{l.country ? `, ${l.country}` : ""}</p>
              <p className="text-sm mt-1">€{l.price} · {l.views} views</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => togglePublish(l)}>
                {l.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(l)}><Pencil className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" onClick={() => remove(l.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
        {!listings.length && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No listings yet — create your first one.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- LISTING FORMS ---------------- */
function ListingFormFields({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label>Title</Label>
        <Input value={value.title} onChange={(e) => set("title", e.target.value)} required />
      </div>
      <div>
        <Label>Type</Label>
        <Select value={value.type} onValueChange={(v) => set("type", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="stay">Stay</SelectItem>
            <SelectItem value="experience">Experience</SelectItem>
            <SelectItem value="activity">Activity</SelectItem>
            <SelectItem value="tour">Tour</SelectItem>
            <SelectItem value="package">Package</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Price (EUR)</Label>
        <Input type="number" min="0" step="0.01" value={value.price} onChange={(e) => set("price", e.target.value)} />
      </div>
      <div>
        <Label>Location</Label>
        <Input value={value.location} onChange={(e) => set("location", e.target.value)} />
      </div>
      <div>
        <Label>Country</Label>
        <Input value={value.country} onChange={(e) => set("country", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Label>Cover image URL</Label>
        <Input value={value.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="https://…" />
      </div>
      <div className="md:col-span-2">
        <Label>Description</Label>
        <Textarea rows={5} value={value.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <Label>Tags (comma separated)</Label>
        <Input value={value.tagsStr} onChange={(e) => set("tagsStr", e.target.value)} placeholder="luxury, beachfront, spa" />
      </div>
    </div>
  );
}

function NewListingForm({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", type: "stay", price: "0", location: "", country: "",
    cover_url: "", description: "", tagsStr: "",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("listings").insert({
      owner_id: user.id,
      title: form.title,
      type: form.type as any,
      price: Number(form.price),
      location: form.location || null,
      country: form.country || null,
      cover_url: form.cover_url || null,
      description: form.description || null,
      tags: form.tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
      status: "draft",
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Listing created as draft"); onCreated(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Inventory</p>
        <h1 className="font-display text-4xl mt-2">New listing</h1>
      </div>
      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 space-y-6">
        <ListingFormFields value={form} onChange={setForm} />
        <Button type="submit" disabled={saving} className="bg-ink text-ivory hover:bg-ink/90">
          {saving ? "Saving…" : "Create listing"}
        </Button>
      </form>
    </div>
  );
}

function EditListingForm({ listing, onDone }: { listing: Listing; onDone: () => void }) {
  const [form, setForm] = useState({
    title: listing.title,
    type: listing.type,
    price: String(listing.price),
    location: listing.location ?? "",
    country: listing.country ?? "",
    cover_url: listing.cover_url ?? "",
    description: listing.description ?? "",
    tagsStr: (listing.tags ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("listings").update({
      title: form.title,
      type: form.type as any,
      price: Number(form.price),
      location: form.location || null,
      country: form.country || null,
      cover_url: form.cover_url || null,
      description: form.description || null,
      tags: form.tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
    }).eq("id", listing.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Listing updated"); onDone(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Editing</p>
        <h1 className="font-display text-4xl mt-2">{listing.title}</h1>
      </div>
      <form onSubmit={submit} className="rounded-xl border border-border bg-card p-6 space-y-6">
        <ListingFormFields value={form} onChange={setForm} />
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="bg-ink text-ivory hover:bg-ink/90">
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- BOOKINGS ---------------- */
function BookingsTab({ bookings, onChanged }: { bookings: Booking[]; onChanged: () => void }) {
  const { user } = useAuth();
  const setStatus = async (id: string, status: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: status as any })
      .eq("id", id)
      .eq("owner_id", user.id);
    if (error) toast.error(error.message); else { toast.success(`Booking ${status}`); onChanged(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reservations</p>
        <h1 className="font-display text-4xl mt-2">Bookings</h1>
      </div>
      <div className="grid gap-4">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-display text-xl">{b.listings?.title ?? "Listing"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {b.check_in ?? "—"} → {b.check_out ?? "—"} · {b.travelers} travelers
                </p>
                <p className="text-sm mt-1">€{b.total_price} {b.currency}</p>
                {b.notes && <p className="text-sm text-muted-foreground mt-2 italic">"{b.notes}"</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="capitalize">{b.status}</Badge>
                {b.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setStatus(b.id, "confirmed")} className="bg-ink text-ivory hover:bg-ink/90">
                      <Check className="h-3 w-3 mr-1" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(b.id, "declined")}>
                      <X className="h-3 w-3 mr-1" /> Decline
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {!bookings.length && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No bookings yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- QUOTES ---------------- */
function QuotesTab({ quotes, onChanged }: { quotes: Quote[]; onChanged: () => void }) {
  const [responding, setResponding] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [price, setPrice] = useState("");

  const send = async (id: string) => {
    const { error } = await supabase.from("quote_requests").update({
      response, quoted_price: price ? Number(price) : null, status: "responded",
    }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Quote sent"); setResponding(null); setResponse(""); setPrice(""); onChanged(); }
  };

  const decline = async (id: string) => {
    const { error } = await supabase.from("quote_requests").update({ status: "declined" }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Declined"); onChanged(); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Concierge</p>
        <h1 className="font-display text-4xl mt-2">Quote requests</h1>
      </div>
      <div className="grid gap-4">
        {quotes.map((q) => (
          <div key={q.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl">{q.destination ?? "Custom trip"}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {q.start_date ?? "—"} → {q.end_date ?? "—"} · {q.travelers} travelers
                  {q.budget ? ` · budget €${q.budget}` : ""}
                </p>
                {q.message && <p className="text-sm mt-3">{q.message}</p>}
                {q.response && (
                  <div className="mt-3 p-3 rounded-md bg-muted">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Your reply</p>
                    <p className="text-sm mt-1">{q.response}</p>
                    {q.quoted_price && <p className="text-sm font-medium mt-1">Quoted: €{q.quoted_price}</p>}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="capitalize">{q.status}</Badge>
            </div>

            {q.status === "open" && (
              responding === q.id ? (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <Textarea placeholder="Your personalized offer…" rows={4} value={response} onChange={(e) => setResponse(e.target.value)} />
                  <Input placeholder="Quoted price (€)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => send(q.id)} className="bg-ink text-ivory hover:bg-ink/90">Send quote</Button>
                    <Button variant="outline" onClick={() => setResponding(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => setResponding(q.id)} className="bg-ink text-ivory hover:bg-ink/90">Respond</Button>
                  <Button size="sm" variant="outline" onClick={() => decline(q.id)}>Decline</Button>
                </div>
              )
            )}
          </div>
        ))}
        {!quotes.length && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No quote requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
