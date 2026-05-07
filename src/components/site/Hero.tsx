import { motion } from "framer-motion";
import hero from "@/assets/hero.jpg";
import { Search, MapPin, CalendarDays, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <motion.img
        src={hero}
        alt="Luxury infinity pool overlooking Santorini caldera at sunset"
        width={1920}
        height={1080}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/10 to-ink/70" />

      <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 md:px-12 pb-16 md:pb-24 text-ivory max-w-7xl mx-auto w-full">
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-[11px] uppercase tracking-[0.4em] text-gold mb-6"
        >
          — A new way to travel
        </motion.p>
        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl text-balance"
        >
          The world,<br />curated for the few.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mt-6 max-w-md text-ivory/70 text-base md:text-lg"
        >
          Stays, experiences and bespoke journeys — handpicked by trusted houses.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="mt-12 glass rounded-2xl p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-0 md:items-center text-ink shadow-2xl"
        >
          <Field icon={<MapPin className="h-4 w-4" />} label="Where" value="Santorini, Greece" />
          <Divider />
          <Field icon={<CalendarDays className="h-4 w-4" />} label="When" value="Jun 12 — Jun 19" />
          <Divider />
          <Field icon={<Users className="h-4 w-4" />} label="Who" value="2 travelers" />
          <button className="bg-ink text-ivory rounded-xl px-6 py-4 md:py-3 flex items-center justify-center gap-2 hover:bg-gold hover:text-ink transition-colors group ml-auto">
            <Search className="h-4 w-4" />
            <span className="text-[12px] uppercase tracking-[0.18em]">Explore</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex-1 px-5 py-2 cursor-pointer rounded-xl hover:bg-ink/5 transition-colors">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-ink/60">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function Divider() {
  return <div className="hidden md:block w-px h-10 bg-ink/10" />;
}
