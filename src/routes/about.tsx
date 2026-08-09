import { createFileRoute, Link } from "@tanstack/react-router";
import { Brush, Heart, Sparkles, Award } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import hero from "@/assets/showcase-canvas.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Artistry by Marium" },
      {
        name: "description",
        content:
          "Meet Artistry by Marium — a creative studio handcrafting canvas paintings, custom artwork, bookmarks and gift bouquets.",
      },
      { property: "og:title", content: "About Artistry by Marium" },
      {
        property: "og:description",
        content: "Our story, our craft, and our love for handmade things.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <section className="container-art py-14 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="eyebrow">
            <span className="gold-divider" /> our story
          </span>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl text-primary">
            A little studio with a big heart
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Artistry by Marium began with a paintbrush, a stack of canvases, and a love letter to
            handmade things. Today, our studio is a quiet corner devoted to slow, intentional craft
            — where every painting, bookmark, and gift bouquet is created by hand, with care, for
            one person at a time.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We believe that art doesn't need to be loud to be loved. The little brushstroke, the
            soft tassel, the unexpected sprig of dried flower — these are the details that turn an
            object into a keepsake.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/gallery" className="btn-ink btn-ink-hover">
              Browse our gallery
            </Link>
            <Link to="/request" className="btn-outline-ink">
              Commission a piece
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[color:var(--bloom)]/15 blur-2xl" />
          <img
            src={hero}
            alt="Studio"
            loading="lazy"
            className="rounded-[1.25rem] shadow-xl ring-1 ring-[color:var(--gold)]/30"
          />
          <img
            src="/logo.jpg"
            alt="logo"
            className="absolute -bottom-8 -left-8 hidden md:block h-32 w-32 rounded-full ring-4 ring-[color:var(--cream)] shadow-xl object-cover"
          />
        </div>
      </section>

      <section className="container-art py-16">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              icon: Brush,
              title: "Handmade",
              text: "Every line painted by hand — no two pieces alike.",
            },
            {
              icon: Heart,
              title: "Personal",
              text: "We translate your story into colour and form.",
            },
            {
              icon: Sparkles,
              title: "Premium",
              text: "Archival materials, gift-ready presentation.",
            },
            {
              icon: Award,
              title: "Crafted to last",
              text: "Pieces designed to be loved for years.",
            },
          ].map((v) => (
            <div key={v.title} className="card-art p-6">
              <div className="h-11 w-11 rounded-full bg-[color:var(--gold)]/15 grid place-items-center">
                <v.icon className="h-5 w-5 text-[color:var(--ink)]" />
              </div>
              <h3 className="mt-4 font-display text-xl text-primary">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-art py-16 text-center max-w-2xl mx-auto">
        <h2 className="font-display text-4xl text-primary">What we create</h2>
        <p className="mt-3 text-muted-foreground">
          Canvas paintings · Custom artwork · Resin & acrylic bookmarks · Gift bouquets ·
          Personalised reading accessories · Decorative art gifts
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
