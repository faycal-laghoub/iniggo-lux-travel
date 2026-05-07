import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Calendar, Users, Star, SlidersHorizontal, X, Heart } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import maldives from "@/assets/dest-maldives.jpg";
import kyoto from "@/assets/dest-kyoto.jpg";
import marrakech from "@/assets/dest-marrakech.jpg";
import alps from "@/assets/dest-alps.jpg";
import balloon from "@/assets/exp-balloon.jpg";
import yacht from "@/assets/exp-yacht.jpg";
import safari from "@/assets/exp-safari.jpg";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search luxury stays & experiences — inigGO" },
      { name: "description", content: "Discover handpicked luxury hotels, villas and curated experiences across the world's most extraordinary destinations." },
      { property: "og:title", content: "Search luxury stays & experiences — inigGO" },
      { property: "og:description", content: "Discover handpicked luxury hotels, villas and curated experiences." },
    ],
  }),
  component: SearchPage,
});

type Listing = {
  id: string;
  title: string;
  location: string;
  type: "Stay" | "Experience" | "Activity";
  tag: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
};

const ALL: Listing[] = [
  { id: "1", title: "Overwater Villa Soneva", location: "Maldives", type: "Stay", tag: "Overwater", price: 2400, rating: 4.95, reviews: 312, image: maldives },
  { id: "2", title: "Ryokan Tawaraya", location: "Kyoto, Japan", type: "Stay", tag: "Heritage", price: 980, rating: 4.92, reviews: 188, image: kyoto },
  { id: "3", title: "Riad El Fenn", location: "Marrakech, Morocco", type: "Stay", tag: "Riad", price: 620, rating: 4.88, reviews: 245, image: marrakech },
  { id: "4", title: "Chalet Pléiades", location: "Courchevel, France", type: "Stay", tag: "Chalet", price: 3200, rating: 4.97, reviews: 96, image: alps },
  { id: "5", title: "Sunrise Balloon Flight", location: "Cappadocia, Turkey", type: "Experience", tag: "Hot air balloon", price: 480, rating: 4.93, reviews: 1240, image: balloon },
  { id: "6", title: "Private Yacht Charter", location: "French Riviera", type: "Experience", tag: "Sailing", price: 1850, rating: 4.9, reviews: 84, image: yacht },
  { id: "7", title: "Big Five Safari Lodge", location: "Serengeti, Tanzania", type: "Experience", tag: "Safari", price: 1420, rating: 4.96, reviews: 421, image: safari },
  { id: "8", title: "Cliffside Suite Aegean", location: "Santorini, Greece", type: "Stay", tag: "Infinity pool", price: 1180, rating: 4.91, reviews: 278, image: hero },
  { id: "9", title: "Geisha Tea Ceremony", location: "Gion, Kyoto", type: "Activity", tag: "Cultural", price: 320, rating: 4.87, reviews: 156, image: kyoto },
  { id: "10", title: "Atlas Mountains Trek", location: "Morocco", type: "Activity", tag: "Adventure", price: 240, rating: 4.82, reviews: 198, image: marrakech },
  { id: "11", title: "Heli-Ski Mont Blanc", location: "Chamonix, France", type: "Experience", tag: "Heli", price: 2100, rating: 4.94, reviews: 64, image: alps },
  { id: "12", title: "Coral Reef Dive", location: "Baa Atoll, Maldives", type: "Activity", tag: "Diving", price: 380, rating: 4.89, reviews: 311, image: maldives },
];

const TYPES = ["All", "Stay", "Experience", "Activity"] as const;
const SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
] as const;

function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [maxPrice, setMaxPrice] = useState(3500);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("recommended");
  const [visible, setVisible] = useState(8);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [dbListings, setDbListings] = useState<Listing[]>([]);

  useEffect(() => {
    supabase.from("listings").select("id, title, type, location, price, cover_url, tags, rating")
      .eq("status", "published")
      .then(({ data }) => {
        if (!data) return;
        const mapped: Listing[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          location: d.location ?? "",
          type: (d.type === "stay" ? "Stay" : d.type === "experience" ? "Experience" : "Activity") as Listing["type"],
          tag: (d.tags?.[0] ?? d.type ?? "Curated"),
          price: Number(d.price),
          rating: Number(d.rating ?? 4.9),
          reviews: 0,
          image: d.cover_url ?? "",
        }));
        setDbListings(mapped);
      });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...dbListings, ...ALL];
    const filtered = all.filter((l) => {
      if (type !== "All" && l.type !== type) return false;
      if (l.price > maxPrice) return false;
      if (l.rating < minRating) return false;
      if (q && !`${l.title} ${l.location} ${l.tag}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [query, type, maxPrice, minRating, sort]);

  const shown = results.slice(0, visible);
  const hasMore = visible < results.length;

  const toggleFav = (id: string) =>
    setFavs((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <Nav />

      {/* Search header */}
      <section className="pt-28 md:pt-32 px-5 md:px-10 pb-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8"
          >
            <p className="text-[11px] uppercase tracking-[0.24em] text-ink/50 mb-2">Discover</p>
            <h1 className="font-display text-3xl md:text-5xl">Find your next escape</h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass rounded-2xl md:rounded-full p-2 md:p-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-0 shadow-sm"
          >
            <div className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2">
              <MapPin className="w-4 h-4 text-ink/50 shrink-0" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(8);
                }}
                placeholder="Where to? Maldives, Kyoto, Alps…"
                className="bg-transparent outline-none text-sm w-full placeholder:text-ink/40"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-ink/10" />
            <div className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2">
              <Calendar className="w-4 h-4 text-ink/50 shrink-0" />
              <input placeholder="Add dates" className="bg-transparent outline-none text-sm w-full placeholder:text-ink/40" />
            </div>
            <div className="hidden md:block w-px h-8 bg-ink/10" />
            <div className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2">
              <Users className="w-4 h-4 text-ink/50 shrink-0" />
              <input placeholder="2 travelers" className="bg-transparent outline-none text-sm w-full placeholder:text-ink/40" />
            </div>
            <button className="md:ml-2 rounded-full bg-ink text-ivory px-6 py-3 md:py-3 text-[12px] uppercase tracking-[0.18em] hover:bg-gold hover:text-ink transition-colors flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Search
            </button>
          </motion.div>

          {/* Toolbar */}
          <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setVisible(8);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-[12px] uppercase tracking-[0.16em] border transition-colors ${
                    type === t
                      ? "bg-ink text-ivory border-ink"
                      : "bg-transparent text-ink/70 border-ink/15 hover:border-ink/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFiltersOpen(true)}
                className="md:hidden rounded-full border border-ink/15 px-4 py-2 text-[12px] uppercase tracking-[0.16em] flex items-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-full border border-ink/15 bg-transparent px-4 py-2 text-[12px] uppercase tracking-[0.16em] focus:outline-none focus:border-ink/40"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="px-5 md:px-10 pb-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
          {/* Sidebar filters */}
          <aside className="hidden md:block">
            <FiltersPanel
              maxPrice={maxPrice}
              setMaxPrice={(v) => {
                setMaxPrice(v);
                setVisible(8);
              }}
              minRating={minRating}
              setMinRating={(v) => {
                setMinRating(v);
                setVisible(8);
              }}
            />
          </aside>

          {/* Grid */}
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] text-ink/50 mb-5">
              {results.length} {results.length === 1 ? "stay" : "stays & experiences"}
            </p>

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {shown.map((l, i) => (
                  <ListingCard key={l.id} l={l} i={i} fav={favs.has(l.id)} onFav={() => toggleFav(l.id)} />
                ))}
              </AnimatePresence>
            </motion.div>

            {results.length === 0 && (
              <div className="py-24 text-center">
                <p className="font-display text-2xl mb-2">Nothing matches yet</p>
                <p className="text-sm text-ink/60">Try widening your filters or another destination.</p>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisible((v) => v + 6)}
                  className="rounded-full border border-ink/20 px-8 py-3 text-[12px] uppercase tracking-[0.18em] hover:bg-ink hover:text-ivory transition-colors"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm md:hidden"
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 bg-ivory rounded-t-3xl p-6 max-h-[85vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-display text-2xl">Filters</p>
                <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-full hover:bg-ink/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FiltersPanel
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                minRating={minRating}
                setMinRating={setMinRating}
              />
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full mt-8 rounded-full bg-ink text-ivory py-4 text-[12px] uppercase tracking-[0.18em]"
              >
                Show {results.length} results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function FiltersPanel({
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
}: {
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  minRating: number;
  setMinRating: (v: number) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50 mb-3">Max price / night</p>
        <input
          type="range"
          min={200}
          max={3500}
          step={50}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-ink"
        />
        <div className="flex justify-between text-[12px] text-ink/60 mt-1">
          <span>$200</span>
          <span className="font-medium text-ink">${maxPrice.toLocaleString()}</span>
          <span>$3,500</span>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50 mb-3">Minimum rating</p>
        <div className="flex gap-2">
          {[0, 4.5, 4.8, 4.9].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex-1 rounded-full border py-2 text-[12px] transition-colors ${
                minRating === r ? "bg-ink text-ivory border-ink" : "border-ink/15 text-ink/70 hover:border-ink/40"
              }`}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-ink/50 mb-3">Style</p>
        <div className="flex flex-wrap gap-2">
          {["Beachfront", "Heritage", "Mountain", "Wellness", "Romantic", "Family"].map((s) => (
            <span
              key={s}
              className="rounded-full border border-ink/15 px-3 py-1.5 text-[12px] text-ink/70 hover:border-ink/40 cursor-pointer transition-colors"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListingCard({
  l,
  i,
  fav,
  onFav,
}: {
  l: Listing;
  i: number;
  fav: boolean;
  onFav: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.55, delay: Math.min(i * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/5] bg-ink/5">
        <motion.img
          src={l.image}
          alt={l.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />

        <button
          onClick={(e) => {
            e.preventDefault();
            onFav();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full glass-dark flex items-center justify-center text-ivory hover:scale-110 transition-transform"
          aria-label="Save"
        >
          <Heart className={`w-4 h-4 ${fav ? "fill-gold text-gold" : ""}`} />
        </button>

        <span className="absolute top-4 left-4 rounded-full bg-ivory/90 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
          {l.tag}
        </span>

        <div className="absolute bottom-0 inset-x-0 p-4 text-ivory">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-ivory/70">{l.type}</p>
              <h3 className="font-display text-lg leading-tight truncate">{l.title}</h3>
              <p className="text-[12px] text-ivory/80 truncate">{l.location}</p>
            </div>
            <div className="flex items-center gap-1 text-[12px] shrink-0">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              {l.rating}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-[12px] text-ink/55">
          <span className="text-ink/30">From</span>{" "}
          <span className="font-medium text-ink">${l.price.toLocaleString()}</span> / night
        </p>
        <p className="text-[11px] text-ink/40">{l.reviews} reviews</p>
      </div>
    </motion.article>
  );
}
