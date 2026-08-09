import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Video } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { Lightbox } from "@/components/Lightbox";
import { supabase } from "@/integrations/supabase/client";
import { signedUrl } from "@/lib/storage";
import { useCategories } from "@/lib/categories";
import { isVideoUrl } from "@/lib/media";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Artistry by Marium" },
      {
        name: "description",
        content:
          "Browse handcrafted canvas paintings, customised artwork, bookmarks, gift bouquets and special creations.",
      },
      { property: "og:title", content: "Gallery — Artistry by Marium" },
      { property: "og:description", content: "A curated gallery of handmade art and gifts." },
    ],
  }),
  component: GalleryPage,
});

type Item = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string;
  resolvedUrl?: string | null;
};

function GalleryPage() {
  const { categories } = useCategories();
  const CATEGORIES = useMemo(() => ["All", ...categories], [categories]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>("All");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_items")
          .select("id, title, category, description, image_url")
          .order("created_at", { ascending: false });
        if (cancelled) return;
        if (error) {
          setLoading(false);
          return;
        }
        const withUrls = await Promise.all(
          (data ?? []).map(async (it) => ({
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

  const visible = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [items, active],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />

      <section className="container-art py-14 lg:py-20 text-center">
        <span className="eyebrow">
          <span className="gold-divider" /> our portfolio
        </span>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl text-primary">The Gallery</h1>
        <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
          A growing collection of pieces from the studio. Tap any artwork to view it larger, and
          contact us to inquire.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                active === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-primary/80 hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="container-art pb-24">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="font-display text-2xl text-primary">The gallery is being curated</p>
            <p className="mt-2 text-muted-foreground">
              New artworks are being added soon. In the meantime, reach out for a custom piece.
            </p>
            <Link to="/request" className="btn-ink btn-ink-hover mt-6">
              Request custom artwork
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            {visible.map((it) => {
              const isVideo = isVideoUrl(it.resolvedUrl);
              return (
                <figure
                  key={it.id}
                  className="break-inside-avoid mb-5 card-art group relative overflow-hidden"
                >
                  <button
                    onClick={() => it.resolvedUrl && setLightbox(it.resolvedUrl)}
                    className="block w-full overflow-hidden relative"
                    aria-label={`View ${it.title}`}
                  >
                    {it.resolvedUrl ? (
                      isVideo ? (
                        <div className="relative">
                          <video
                            src={it.resolvedUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto hover-zoom-img object-cover min-h-[160px]"
                          />
                          <span className="absolute top-2.5 right-2.5 bg-black/75 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <Video className="h-3 w-3 text-amber-400" /> Video
                          </span>
                        </div>
                      ) : (
                        <img
                          src={it.resolvedUrl}
                          alt={it.title}
                          loading="lazy"
                          className="w-full h-auto hover-zoom-img"
                        />
                      )
                    ) : (
                      <div className="aspect-[4/5] bg-muted animate-pulse" />
                    )}
                  </button>
                  <figcaption className="p-4">
                    <div className="text-xs uppercase tracking-widest text-[color:var(--gold)]">
                      {it.category}
                    </div>
                    <h3 className="font-display text-xl text-primary mt-1">{it.title}</h3>
                    {it.description && (
                      <p className="text-sm text-muted-foreground mt-1">{it.description}</p>
                    )}
                    <Link
                      to="/contact"
                      className="mt-3 inline-flex text-sm font-medium text-primary"
                    >
                      Contact for price →
                    </Link>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </section>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      <SiteFooter />
    </div>
  );
}
