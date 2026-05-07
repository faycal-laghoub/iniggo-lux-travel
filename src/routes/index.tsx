import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Destinations } from "@/components/site/Destinations";
import { Experiences } from "@/components/site/Experiences";
import { Concierge } from "@/components/site/Concierge";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "inigGO — The luxury travel maison" },
      {
        name: "description",
        content: "Stays, experiences and bespoke journeys curated by trusted travel houses.",
      },
      { property: "og:title", content: "inigGO — The luxury travel maison" },
      {
        property: "og:description",
        content: "Stays, experiences and bespoke journeys curated by trusted travel houses.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-background text-foreground">
      <Nav />
      <Hero />
      <Destinations />
      <Experiences />
      <Concierge />
      <Footer />
    </main>
  );
}
