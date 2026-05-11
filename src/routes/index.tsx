import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Calendar, Users, Plane, Ship, Compass, Hotel, ArrowRight, Star, ShieldCheck, Sparkles, Phone } from "lucide-react";
import heroImg from "@/assets/hero-mediterranean.jpg";
import santoriniImg from "@/assets/dest-santorini.jpg";
import safariImg from "@/assets/dest-safari.jpg";
import kyotoImg from "@/assets/dest-kyoto.jpg";
import maldivesImg from "@/assets/dest-maldives.jpg";
import marrakechImg from "@/assets/dest-marrakech.jpg";
import patagoniaImg from "@/assets/dest-patagonia.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "inigGO — Voyages d'exception, sélectionnés par des experts" },
      { name: "description", content: "Séjours, circuits, croisières et expériences sur-mesure. Une sélection rigoureuse signée par les meilleures agences de voyage." },
      { property: "og:title", content: "inigGO — Voyages d'exception" },
      { property: "og:description", content: "La marketplace lux des voyages organisés." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Home,
});

const TABS = [
  { id: "sejours", label: "Séjours", icon: Hotel },
  { id: "circuits", label: "Circuits", icon: Compass },
  { id: "vols", label: "Vols + Hôtel", icon: Plane },
  { id: "croisieres", label: "Croisières", icon: Ship },
] as const;

const DESTINATIONS = [
  { name: "Santorin", country: "Grèce", img: santoriniImg, from: "1 290 €", nights: "7 nuits" },
  { name: "Serengeti", country: "Tanzanie", img: safariImg, from: "3 450 €", nights: "9 nuits" },
  { name: "Kyoto", country: "Japon", img: kyotoImg, from: "2 180 €", nights: "10 nuits" },
  { name: "Maldives", country: "Océan Indien", img: maldivesImg, from: "2 890 €", nights: "7 nuits" },
  { name: "Marrakech", country: "Maroc", img: marrakechImg, from: "780 €", nights: "5 nuits" },
  { name: "Patagonie", country: "Argentine", img: patagoniaImg, from: "4 120 €", nights: "12 nuits" },
];

function Home() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("sejours");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-ivory">
            <span className="font-display text-2xl tracking-tight">inigGO</span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.25em] opacity-70">Travel Curation</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-9 text-sm text-ivory/85">
            <a href="#destinations" className="hover:text-gold transition">Destinations</a>
            <Link to="/search" className="hover:text-gold transition">Séjours</Link>
            <Link to="/search" className="hover:text-gold transition">Circuits</Link>
            <Link to="/search" className="hover:text-gold transition">Croisières</Link>
            <Link to="/search" className="hover:text-gold transition">Sur-mesure</Link>
            <a href="#agences" className="hover:text-gold transition">Agences</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="tel:+33000000000" className="hidden md:inline-flex items-center gap-2 text-ivory/85 text-sm hover:text-gold transition">
              <Phone className="h-4 w-4" /> 01 23 45 67 89
            </a>
            <Link
              to="/auth"
              className="px-4 py-2 rounded-full glass text-ivory text-sm hover:bg-ivory/15 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Villa de luxe en bord de Méditerranée au coucher du soleil"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/25 to-ink/75" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 h-full flex flex-col justify-center">
          <div className="max-w-3xl text-ivory">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gold-soft">
              <span className="h-px w-8 bg-gold" /> La maison du voyage curaté
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mt-6 text-balance">
              Le voyage, comme une œuvre.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ivory/85 max-w-2xl font-light leading-relaxed">
              Séjours signés, circuits confidentiels et expériences sur-mesure — composés par les meilleures agences, réunis pour vous.
            </p>
          </div>

          {/* SEARCH PANEL */}
          <div className="mt-12 max-w-5xl">
            <div className="flex flex-wrap gap-1 mb-0">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={[
                      "flex items-center gap-2 px-5 py-3 rounded-t-lg text-sm transition",
                      active
                        ? "bg-ivory text-ink"
                        : "glass-dark text-ivory hover:bg-ink/55",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="bg-ivory rounded-tr-lg rounded-b-lg shadow-2xl p-3 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <Field className="md:col-span-4" icon={MapPin} label="Destination" placeholder="Île, ville, pays…" />
                <Field className="md:col-span-3" icon={Calendar} label="Départ" placeholder="Quand ?" type="date" />
                <Field className="md:col-span-3" icon={Calendar} label="Retour" placeholder="Quand ?" type="date" />
                <Field className="md:col-span-2" icon={Users} label="Voyageurs" placeholder="2 adultes" />
              </div>
              <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> Paiement sécurisé</span>
                  <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-gold" /> Conciergerie 7j/7</span>
                  <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-gold" /> Agences certifiées</span>
                </div>
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 bg-ink text-ivory px-8 py-3.5 rounded-md text-sm font-medium hover:bg-ink/85 transition"
                >
                  <Search className="h-4 w-4" /> Rechercher
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-muted-foreground">
          <span className="hidden md:inline">Membres de notre maison</span>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3 font-display text-base text-ink/70">
            <span>Selectour</span>
            <span>Havas Voyages</span>
            <span>Marietton</span>
            <span>TUI</span>
            <span>Voyageurs du Monde</span>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <div className="flex items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Sélection de la maison</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3">Destinations à l'honneur</h2>
          </div>
          <Link to="/search" className="hidden md:inline-flex items-center gap-2 text-sm text-ink hover:text-gold transition">
            Tout explorer <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.name}
              to="/search"
              className="group relative overflow-hidden rounded-lg bg-muted aspect-[4/5]"
            >
              <img
                src={d.img}
                alt={`${d.name}, ${d.country}`}
                width={1024}
                height={1280}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gold-soft">{d.country}</p>
                <h3 className="font-display text-3xl mt-1">{d.name}</h3>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="opacity-90">{d.nights}</span>
                  <span>à partir de <strong className="font-display text-lg">{d.from}</strong></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* EDITORIAL — PROMISE */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">L'esprit inigGO</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
              Un voyage curaté, jamais standardisé.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Nous travaillons main dans la main avec des agences indépendantes et des maisons reconnues pour vous offrir des voyages signés, vérifiés et accompagnés. Chaque itinéraire est pensé comme une expérience.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/search" className="inline-flex items-center gap-2 bg-ink text-ivory px-7 py-3 rounded-md text-sm hover:bg-ink/85 transition">
                Découvrir la sélection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" className="text-sm text-ink hover:text-gold transition">Devenir partenaire →</Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            {[
              { k: "+ 320", v: "Agences partenaires", icon: ShieldCheck },
              { k: "85", v: "Pays couverts", icon: MapPin },
              { k: "4.9 / 5", v: "Note voyageurs", icon: Star },
              { k: "24 / 7", v: "Conciergerie privée", icon: Sparkles },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.v} className="bg-ivory rounded-lg p-6 border border-border">
                  <Icon className="h-5 w-5 text-gold" />
                  <p className="font-display text-3xl mt-4">{s.k}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.v}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXPERIENCES */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10 py-24">
        <div className="text-center mb-14">
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Inspirations</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3">Voyager autrement</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Lunes de miel", img: maldivesImg },
            { label: "Safaris privés", img: safariImg },
            { label: "Cités d'Asie", img: kyotoImg },
            { label: "Grands espaces", img: patagoniaImg },
          ].map((e) => (
            <Link key={e.label} to="/search" className="group relative aspect-square overflow-hidden rounded-lg">
              <img src={e.img} alt={e.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-ink/30 group-hover:bg-ink/50 transition" />
              <div className="absolute inset-0 flex items-end p-5">
                <span className="font-display text-xl text-ivory">{e.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AGENCIES CTA */}
      <section id="agences" className="relative overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0 opacity-25">
          <img src={heroImg} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-gold-soft">Pour les agences</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 leading-tight">
              Rejoignez la maison inigGO.
            </h2>
            <p className="mt-6 text-ivory/80 max-w-xl leading-relaxed">
              Distribuez vos voyages auprès d'une clientèle qualifiée et exigeante. Outils de gestion, paiements sécurisés, visibilité éditoriale.
            </p>
            <Link to="/auth" className="mt-8 inline-flex items-center gap-2 bg-gold text-ink px-7 py-3 rounded-md text-sm font-medium hover:bg-gold-soft transition">
              Devenir partenaire <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Distribution premium",
              "Conciergerie partagée",
              "Paiements sécurisés",
              "Outils pro complets",
            ].map((f) => (
              <div key={f} className="glass-dark rounded-lg p-5">
                <Sparkles className="h-4 w-4 text-gold" />
                <p className="font-display text-lg mt-3">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid md:grid-cols-4 gap-10 text-sm">
          <div>
            <p className="font-display text-2xl">inigGO</p>
            <p className="mt-3 text-muted-foreground">La maison du voyage curaté.</p>
          </div>
          <FooterCol title="Explorer" links={["Séjours", "Circuits", "Croisières", "Sur-mesure"]} />
          <FooterCol title="Maison" links={["À propos", "Agences partenaires", "Conciergerie", "Carrières"]} />
          <FooterCol title="Aide" links={["Centre d'aide", "Mentions légales", "CGV", "Confidentialité"]} />
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 text-xs text-muted-foreground flex justify-between">
            <span>© {new Date().getFullYear()} inigGO</span>
            <span>Voyages organisés • Paris</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
  type = "text",
  className = "",
}: {
  icon: typeof MapPin;
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`group flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary transition cursor-text ${className}`}>
      <Icon className="h-5 w-5 text-gold shrink-0" />
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm text-ink placeholder:text-muted-foreground/70"
        />
      </span>
    </label>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l}><a href="#" className="text-ink/80 hover:text-gold transition">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}
