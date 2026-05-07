export function Footer() {
  return (
    <footer className="bg-ink text-ivory px-6 md:px-12 pt-20 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 pb-16 border-b border-ivory/10">
          <div className="md:col-span-2">
            <div className="font-display text-3xl">
              inig<span className="text-gold">GO</span>
            </div>
            <p className="text-ivory/50 mt-4 max-w-sm text-sm leading-relaxed">
              The luxury travel marketplace — stays, experiences and bespoke journeys, curated by trusted houses.
            </p>
          </div>
          {[
            ["Discover", ["Stays", "Experiences", "Destinations", "Journal"]],
            ["Maison", ["Concierge", "For agencies", "About", "Contact"]],
          ].map(([title, items]) => (
            <div key={title as string}>
              <div className="text-[11px] uppercase tracking-[0.3em] text-gold mb-5">{title}</div>
              <ul className="space-y-3 text-ivory/70 text-sm">
                {(items as string[]).map((i) => (
                  <li key={i} className="hover:text-ivory cursor-pointer transition-colors">{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between gap-4 text-[11px] uppercase tracking-[0.2em] text-ivory/40">
          <div>© 2026 inigGO Maison</div>
          <div className="flex gap-6">
            <span>Privacy</span><span>Terms</span><span>FR / EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
