import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brush,
  Flower2,
  Bookmark,
  Sparkles,
  Quote,
  Loader2,
  Video,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter, INSTAGRAM, WA_DIGITS } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { signedUrl } from "@/lib/storage";
import { isVideoUrl } from "@/lib/media";
import heroImg from "@/assets/hero-artwork.jpg";
import canvasImg from "@/assets/showcase-canvas.jpg";
import bouquetImg from "@/assets/showcase-bouquet.jpg";
import bookmarkImg from "@/assets/showcase-bookmark.jpg";
import customImg from "@/assets/showcase-custom.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Artistry by Marium — Handcrafted Art, Bookmarks & Gift Bouquets" },
      {
        name: "description",
        content:
          "Beautiful canvas paintings, custom artwork, handmade bookmarks and creative gift bouquets — designed with passion and elegance.",
      },
      { property: "og:title", content: "Artistry by Marium" },
      { property: "og:description", content: "Handcrafted art that tells your story." },
    ],
  }),
  component: Home,
});

type Collection = {
  title: string;
  blurb: string;
  image: string;
  icon: typeof Brush;
};
const collections: Collection[] = [
  {
    title: "Canvas Paintings",
    blurb: "Original hand-painted canvases in florals, abstracts & portraits.",
    image: canvasImg,
    icon: Brush,
  },
  {
    title: "Gift Bouquets",
    blurb: "Bespoke bouquets that gather perfume, keepsakes & felt blooms.",
    image: bouquetImg,
    icon: Flower2,
  },
  {
    title: "Handmade Bookmarks",
    blurb: "Resin & acrylic bookmarks with tassels — perfect reading companions.",
    image: bookmarkImg,
    icon: Bookmark,
  },
  {
    title: "Custom Artwork",
    blurb: "Personalised calligraphy, name art & one-of-a-kind keepsakes.",
    image: customImg,
    icon: Sparkles,
  },
];

const bookmarks = [
  {
    name: "Just One More Page",
    desc: "Sage resin bookmark with hand-painted daisies & ivory tassel.",
  },
  { name: "Botanic Verse", desc: "Pressed greenery sealed in clear resin, gold-leaf accents." },
  { name: "Pink Bloom", desc: "Soft pink acrylic with dried florals & a satin ribbon tassel." },
];

type FeaturedItem = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string;
  resolvedUrl?: string | null;
};

/** Pulls the artworks the admin has marked "Feature on homepage" in the Gallery tab. */
function useFeaturedGallery() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_items")
          .select("id, title, category, description, image_url")
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(8);
        if (cancelled) return;
        if (error || !data) {
          setLoading(false);
          return;
        }
        const withUrls = await Promise.all(
          data.map(async (it) => ({
            ...it,
            resolvedUrl: await signedUrl("gallery", it.image_url),
          })),
        );
        if (!cancelled) {
          setItems(withUrls);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return { items, loading };
}

function Home() {
  const { items: featured, loading: featuredLoading } = useFeaturedGallery();
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-art grid lg:grid-cols-2 gap-10 lg:gap-16 items-center pt-10 pb-20 lg:pt-20 lg:pb-32">
          <div className="animate-fade-up">
            <span className="eyebrow">
              <span className="gold-divider" /> handmade with love
            </span>
            <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-primary">
              Handcrafted art
              <br />
              that tells
              <span className="font-script text-[color:var(--gold)]"> your story</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Beautiful canvas paintings, custom artwork, handmade bookmarks, and creative gift
              bouquets — designed with passion and elegance in our little studio.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/gallery" className="btn-ink btn-ink-hover">
                Explore Gallery <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-outline-ink">
                Contact Us
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              {[
                ["120+", "Pieces"],
                ["80+", "Happy gifts"],
                ["100%", "Handmade"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-3xl text-primary">{n}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-[color:var(--gold)]/15 to-[color:var(--bloom)]/15 blur-2xl" />
            <div className="relative rounded-[1.5rem] overflow-hidden ring-1 ring-[color:var(--gold)]/40 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
              <img
                src={heroImg}
                alt="Handmade art flat lay"
                width={1600}
                height={1200}
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 bg-card rounded-full pl-2 pr-5 py-2 shadow-lg border border-border">
              <div className="h-10 w-10 rounded-full bg-[color:var(--gold)]/20 grid place-items-center">
                <Sparkles className="h-5 w-5 text-[color:var(--gold)]" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-primary">One-of-a-kind</div>
                <div className="text-xs text-muted-foreground">made just for you</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED FROM THE STUDIO — pulls whatever the admin has marked "Feature on homepage" */}
      {(featuredLoading || featured.length > 0) && (
        <section className="container-art py-16 lg:py-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="eyebrow">
              <span className="gold-divider" /> fresh from the studio
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl text-primary">Featured pieces</h2>
            <p className="mt-3 text-muted-foreground">
              Hand-picked highlights from the latest gallery additions.
            </p>
          </div>

          {featuredLoading ? (
            <div className="mt-12 grid place-items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((it) => {
                const isVideo = isVideoUrl(it.resolvedUrl);
                return (
                  <Link key={it.id} to="/gallery" className="card-art group block">
                    <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                      {it.resolvedUrl ? (
                        isVideo ? (
                          <div className="h-full w-full relative">
                            <video
                              src={it.resolvedUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="h-full w-full object-cover hover-zoom-img"
                            />
                            <span className="absolute top-2.5 right-2.5 bg-black/75 text-white backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Video className="h-3 w-3 text-amber-400" /> Video
                            </span>
                          </div>
                        ) : (
                          <img
                            src={it.resolvedUrl}
                            alt={it.title}
                            loading="lazy"
                            className="h-full w-full object-cover hover-zoom-img"
                          />
                        )
                      ) : (
                        <div className="h-full w-full animate-pulse" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="text-xs uppercase tracking-widest text-[color:var(--gold)]">
                        {it.category}
                      </div>
                      <h3 className="mt-1 font-display text-2xl text-primary">{it.title}</h3>
                      {it.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {it.description}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* FEATURED COLLECTIONS */}
      <section className="container-art py-16 lg:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">
            <span className="gold-divider" /> our collections
          </span>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl text-primary">
            A studio of small wonders
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every piece is dreamt up, painted, and packaged by hand.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c) => (
            <article key={c.title} className="card-art group">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover hover-zoom-img"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[color:var(--gold)]">
                  <c.icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-widest">collection</span>
                </div>
                <h3 className="mt-2 font-display text-2xl text-primary">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all"
                >
                  Contact for price <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BOOKMARK SHOWCASE */}
      <section className="bg-[color:var(--beige)]/60 border-y border-border">
        <div className="container-art py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-[color:var(--gold)]/15 blur-2xl" />
            <img
              src={bookmarkImg}
              alt="Handcrafted bookmark"
              loading="lazy"
              className="rounded-[1.25rem] shadow-xl ring-1 ring-[color:var(--gold)]/30"
            />
          </div>
          <div className="order-1 lg:order-2">
            <span className="eyebrow">
              <span className="gold-divider" /> for the readers
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl text-primary">
              Handcrafted Bookmarks
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Tiny pieces of art for the moments between chapters — resin, acrylic and hand-painted
              designs finished with silken tassels. Each one is unique, gift-worthy, and made to
              last.
            </p>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {bookmarks.map((b) => (
                <div key={b.name} className="card-art p-4">
                  <h4 className="font-display text-xl text-primary">{b.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
                  <Link
                    to="/contact"
                    className="mt-3 inline-flex text-sm text-[color:var(--gold)] font-medium"
                  >
                    Request details →
                  </Link>
                </div>
              ))}
            </div>
            <Link to="/gallery" className="btn-ink btn-ink-hover mt-8">
              View bookmark gallery
            </Link>
          </div>
        </div>
      </section>

      {/* CUSTOM CTA */}
      <section className="container-art py-20 lg:py-28">
        <div className="rounded-[1.5rem] overflow-hidden border border-border bg-card grid lg:grid-cols-2">
          <div className="p-10 lg:p-14">
            <span className="eyebrow">
              <span className="gold-divider" /> made to order
            </span>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl text-primary">
              Have a piece in mind?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Send us your reference photo and a few details — we'll bring it to life on canvas, in
              resin, or as a bespoke bouquet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/request" className="btn-gold">
                Upload your reference
              </Link>
              <a
                href={`https://wa.me/${WA_DIGITS}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline-ink"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="relative aspect-[5/4] lg:aspect-auto">
            <img
              src={customImg}
              alt="Custom artwork"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / QUOTE */}
      <section className="container-art pb-24 text-center max-w-3xl mx-auto">
        <Quote className="h-8 w-8 mx-auto text-[color:var(--gold)]" />
        <p className="mt-4 font-display text-2xl sm:text-3xl text-primary leading-snug">
          “Each piece felt like it was made just for me — the colours, the little hand-painted
          details, the way it arrived wrapped like a treasure.”
        </p>
        <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
          A happy customer ·{" "}
          <a href={INSTAGRAM} target="_blank" rel="noreferrer" className="text-[color:var(--gold)]">
            @artistry_by_marium
          </a>
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
