import { motion } from "framer-motion";

export function Concierge() {
  return (
    <section className="px-6 md:px-12 py-24 md:py-40 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="lg:col-span-7"
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-6">— Private Concierge</p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1] text-balance">
            A house of agencies. <span className="italic text-ink/60">At your service.</span>
          </h2>
          <p className="mt-8 max-w-xl text-ink/60 text-lg leading-relaxed">
            Tell us your dream. A trusted travel maison crafts a bespoke journey within 48 hours — quietly, elegantly, on your terms.
          </p>
          <div className="mt-10 flex gap-4">
            <button className="bg-ink text-ivory px-7 py-4 text-[12px] uppercase tracking-[0.18em] rounded-full hover:bg-gold hover:text-ink transition-colors">
              Request a journey
            </button>
            <button className="border border-ink/20 px-7 py-4 text-[12px] uppercase tracking-[0.18em] rounded-full hover:border-gold hover:text-gold transition-colors">
              Become a partner
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.15 }}
          className="lg:col-span-5 space-y-px"
        >
          {[
            ["01", "Share your vision", "Dates, mood, who's coming."],
            ["02", "Receive proposals", "Three curated routes within 48h."],
            ["03", "Travel, taken care of", "One contact, end to end."],
          ].map(([n, t, d]) => (
            <div key={n} className="border-t border-ink/10 py-7 flex gap-6 group cursor-pointer">
              <div className="font-display text-gold text-xl w-12">{n}</div>
              <div>
                <div className="font-display text-2xl">{t}</div>
                <div className="text-ink/55 mt-1 text-sm">{d}</div>
              </div>
            </div>
          ))}
          <div className="border-t border-ink/10" />
        </motion.div>
      </div>
    </section>
  );
}
