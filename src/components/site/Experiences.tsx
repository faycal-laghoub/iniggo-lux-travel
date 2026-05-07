import { motion } from "framer-motion";
import balloon from "@/assets/exp-balloon.jpg";
import yacht from "@/assets/exp-yacht.jpg";
import safari from "@/assets/exp-safari.jpg";

const items = [
  { img: balloon, name: "Sunrise above Cappadocia", host: "Atelier Anatolia", price: "€480" },
  { img: yacht, name: "Private yacht, Côte d'Azur", host: "Maison Bleu", price: "€2,400" },
  { img: safari, name: "Serengeti tented camp", host: "Karibu &Co.", price: "€1,180" },
];

export function Experiences() {
  return (
    <section className="bg-ink text-ivory px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-4">— Experiences</p>
            <h2 className="font-display text-4xl md:text-6xl max-w-2xl text-balance">
              Crafted by hosts<br />who know.
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {items.map((it, i) => (
            <motion.a
              key={it.name}
              href="#"
              initial={{ y: 60, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-5">
                <img
                  src={it.img}
                  alt={it.name}
                  loading="lazy"
                  width={1280}
                  height={896}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-110"
                />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-ivory/50 mb-1">{it.host}</div>
                  <div className="font-display text-xl md:text-2xl group-hover:text-gold transition-colors">
                    {it.name}
                  </div>
                </div>
                <div className="text-sm text-ivory/70 whitespace-nowrap pl-4">
                  from <span className="text-gold">{it.price}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
