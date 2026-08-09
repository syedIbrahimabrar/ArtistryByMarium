import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MessageCircle } from "lucide-react";

export const PHONE = "03703077719";
export const WA_DIGITS = "923703077719"; // PK country code
export const EMAIL = "Syeda.m462006@gmail.com";
export const INSTAGRAM =
  "https://www.instagram.com/artistry_by_marium?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
export const FACEBOOK = "https://www.facebook.com/profile.php?id=100088693053286";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-[color:var(--beige)]/60">
      <div className="container-art grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-1 ring-[color:var(--gold)]/40"
            />
            <div>
              <div className="font-display text-xl text-primary">Artistry by Marium</div>
              <div className="font-script text-[color:var(--gold)] text-sm -mt-1">
                handmade · with love
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
            A creative studio crafting canvas paintings, custom artwork, handmade bookmarks, and
            personalised gift bouquets — each piece designed to tell your story.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-primary">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary/80">
            <li>
              <Link to="/gallery" className="hover:text-primary">
                Gallery
              </Link>
            </li>
            <li>
              <Link to="/request" className="hover:text-primary">
                Custom Order
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-widest uppercase text-primary">Connect</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary/80">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> <a href={`tel:${PHONE}`}>{PHONE}</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />{" "}
              <a href={`https://wa.me/${WA_DIGITS}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" />{" "}
              <a href={`mailto:${EMAIL}`} className="break-all">
                {EMAIL}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="h-10 w-10 grid place-items-center rounded-full border border-border text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={FACEBOOK}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="h-10 w-10 grid place-items-center rounded-full border border-border text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={`https://wa.me/${WA_DIGITS}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="h-10 w-10 grid place-items-center rounded-full border border-border text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-art flex flex-col md:flex-row items-center justify-between gap-2 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Artistry by Marium. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
