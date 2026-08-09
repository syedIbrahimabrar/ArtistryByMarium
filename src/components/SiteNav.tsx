import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/gallery", label: "Gallery" },
  { to: "/request", label: "Custom Order" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const loc = useLocation();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY <= 40) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY + 8) {
        // Scrolling down
        setVisible(false);
      } else if (currentScrollY < lastScrollY - 8) {
        // Scrolling up
        setVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 transform ${
        visible || open ? "translate-y-0" : "-translate-y-full"
      } ${
        scrolled
          ? "bg-[color:var(--cream)]/90 backdrop-blur border-b border-border shadow-[0_4px_24px_-18px_rgba(0,0,0,0.25)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-art flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.jpg"
            alt="Artistry By Marium"
            className="h-12 w-12 rounded-full object-cover ring-1 ring-[color:var(--gold)]/40"
          />
          <div className="leading-tight">
            <div className="font-display text-xl text-primary">Artistry by Marium</div>
            <div className="font-script text-[color:var(--gold)] text-sm -mt-1">
              handmade · with love
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 rounded-full text-sm tracking-wide text-primary/80 hover:text-primary hover:bg-secondary transition-colors"
              activeProps={{ className: "text-primary bg-secondary" }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/request" className="btn-ink btn-ink-hover ml-3">
            Order Now
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-border text-primary"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-[color:var(--cream)]">
          <nav className="container-art flex flex-col py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="py-3 text-primary/85 border-b border-border last:border-0"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/request" className="btn-ink btn-ink-hover mt-3 self-start">
              Order Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
