import { useState } from "react";

export default function IndexPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-6 border-b">
        <div className="text-2xl font-semibold tracking-tight">
          inigGO
        </div>

        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          <a href="/search">Packages</a>
          <a href="/search">Circuits</a>
          <a href="/search">Agences</a>
          <a href="/dashboard">Become Partner</a>
        </nav>

        <a
          href="/auth"
          className="px-4 py-2 rounded-full bg-black text-white text-sm"
        >
          Sign in
        </a>
      </header>

      {/* HERO */}
      <section className="text-center px-6 py-24 bg-gradient-to-b from-gray-50 to-white">
        <h1 className="text-5xl font-semibold mb-4">
          Discover curated travel experiences
        </h1>

        <p className="text-gray-500 max-w-2xl mx-auto mb-10">
          Premium organized trips, luxury packages, and trusted travel agencies —
          all in one place.
        </p>

        {/* SEARCH */}
        <div className="flex justify-center">
          <div className="flex bg-white shadow-md rounded-full overflow-hidden w-full max-w-2xl border">
            <input
              type="text"
              placeholder="Where do you want to travel?"
              className="flex-1 px-6 py-4 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="px-8 bg-black text-white">
              Explore
            </button>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="px-8 py-16 grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">Curated Packages</h3>
          <p className="text-sm text-gray-500">
            Handpicked travel experiences designed by experts.
          </p>
        </div>

        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">Trusted Agencies</h3>
          <p className="text-sm text-gray-500">
            Partner with certified travel agencies worldwide.
          </p>
        </div>

        <div className="p-6 border rounded-2xl">
          <h3 className="font-semibold mb-2">Luxury Experiences</h3>
          <p className="text-sm text-gray-500">
            Premium journeys combining comfort and discovery.
          </p>
        </div>
      </section>

      {/* FEATURED PACKAGES */}
      <section className="px-8 pb-20">
        <h2 className="text-xl font-semibold mb-6">
          Featured Travel Packages
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl overflow-hidden border hover:shadow-lg transition"
            >
              <div className="h-48 bg-gray-200" />

              <div className="p-4">
                <p className="font-medium">
                  Mediterranean Discovery {item}
                </p>
                <p className="text-sm text-gray-500">
                  7 days • France, Italy, Spain
                </p>

                <div className="mt-3 flex justify-between items-center">
                  <span className="font-semibold">$899</span>
                  <a
                    href="/search"
                    className="text-sm px-3 py-1 border rounded-full"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="px-8 py-16 bg-gray-50">
        <h2 className="text-center text-lg font-medium mb-8">
          Trusted by travel agencies
        </h2>

        <div className="flex justify-center gap-10 text-gray-400 text-sm">
          <span>Selectour</span>
          <span>Havas Voyages</span>
          <span>Local Agencies</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-500 py-10 border-t">
        © {new Date().getFullYear()} inigGO — Organized Travel Marketplace
      </footer>
    </div>
  );
}
