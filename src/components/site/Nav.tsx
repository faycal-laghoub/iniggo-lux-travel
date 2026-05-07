import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Stays", to: "/search" },
  { label: "Experiences", to: "/search" },
  { label: "Concierge", to: "/" },
  { label: "Journal", to: "/" },
];

export function Nav() {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-6 md:px-10 pt-5"
    >
      <div className="glass-dark mx-auto max-w-7xl rounded-full px-6 md:px-8 py-3 flex items-center justify-between text-ivory">
        <Link to="/" className="font-display text-xl tracking-tight">
          inig<span className="text-gold">GO</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-[13px] uppercase tracking-[0.18em] text-ivory/80">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="hover:text-gold transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline text-[12px] uppercase tracking-[0.18em] text-ivory/70 hover:text-ivory transition-colors px-3">
            FR / EN
          </button>
          <Link
            to={user ? "/account" : "/auth"}
            className="rounded-full bg-ivory text-ink px-5 py-2 text-[12px] uppercase tracking-[0.18em] hover:bg-gold transition-colors"
          >
            {user ? "Account" : "Sign in"}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
