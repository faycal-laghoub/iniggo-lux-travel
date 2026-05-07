import { motion } from "framer-motion";
import maldives from "@/assets/dest-maldives.jpg";
import kyoto from "@/assets/dest-kyoto.jpg";
import marrakech from "@/assets/dest-marrakech.jpg";
import alps from "@/assets/dest-alps.jpg";

const items = [
  { img: maldives, name: "Maldives", tag: "Overwater", count: "24 stays" },
  { img: kyoto, name: "Kyoto", tag: "Heritage", count: "18 stays" },
  { img: marrakech, name: "Marrakech", tag: "Riads", count: "31 stays" },
  { img: alps, name: "Swiss Alps", tag: "Chalets", count: "12 stays" },
];

export function Destinations() {
  return (
    <section className="px-6 md:px-12 py-24 md:py-32 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12 md:mb-16">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-4">— Destinations</p>
          <h2 className="font-display text-4xl md:text-6xl max-w-2xl text-balance">
            Where stories begin.
          </h2>
        </div>
        <button className="hidden md:inline text-[12px] uppercase tracking-[0.18em] border-b border-ink pb-1 hover:text-gold hover:border-gold transition-colors">
          View all
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((item, i) => (
          <motion.a
            key={item.name}
            href="#"
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: i * 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="group relative block aspect-[3/4] overflow-hidden rounded-sm"
          >
            <img
              src={item.img}
              alt={item.name}
              loading="lazy"
              width={1024}
              height={1280}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7 text-ivory">
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">{item.tag}</div>
              <div className="font-display text-2xl md:text-3xl mt-1">{item.name}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-ivory/60 mt-2">{item.count}</div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
