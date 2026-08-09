import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Instagram, Facebook, MessageCircle, Mail, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter, EMAIL, PHONE, WA_DIGITS, INSTAGRAM, FACEBOOK } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { sendEmailNotification } from "@/lib/notifications";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Artistry by Marium" },
      {
        name: "description",
        content: "Get in touch with Artistry by Marium for custom orders, pricing, and inquiries.",
      },
      { property: "og:title", content: "Contact Artistry by Marium" },
      {
        property: "og:description",
        content: "Reach us by WhatsApp, email, Instagram or Facebook.",
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid email").max(120),
  message: z.string().trim().min(5, "Please tell us a bit more").max(2000),
});

function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert(parsed.data);
      setLoading(false);
      if (error) {
        toast.error("Could not send: " + error.message);
        return;
      }

      // Send email notification to Syeda.m462006@gmail.com
      sendEmailNotification({
        type: "contact_message",
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
      }).catch((e) => console.warn("Email notification error:", e));

      toast.success("Message sent — we'll be in touch soon!");
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Network error";
      toast.error("Could not send message: " + msg);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <section className="container-art py-14 lg:py-20 text-center max-w-2xl mx-auto">
        <span className="eyebrow">
          <span className="gold-divider" /> say hello
        </span>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl text-primary">
          Let's create together
        </h1>
        <p className="mt-3 text-muted-foreground">
          For pricing, custom orders, or just to share your idea — we'd love to hear from you.
        </p>
      </section>

      <section className="container-art pb-20 grid lg:grid-cols-2 gap-8">
        <div className="card-art p-6 lg:p-8">
          <h2 className="font-display text-2xl text-primary">Send a message</h2>
          <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
            <input
              name="name"
              required
              placeholder="Your name"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/50"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Your email"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/50"
            />
            <textarea
              name="message"
              rows={6}
              required
              placeholder="Tell us about your idea…"
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-ink btn-ink-hover disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>

        <div className="card-art p-6 lg:p-8">
          <h2 className="font-display text-2xl text-primary">Reach out directly</h2>
          <ul className="mt-6 space-y-4">
            <ContactRow
              icon={<Phone className="h-4 w-4" />}
              label="Phone"
              value={PHONE}
              href={`tel:${PHONE}`}
            />
            <ContactRow
              icon={<MessageCircle className="h-4 w-4" />}
              label="WhatsApp"
              value="Message us on WhatsApp"
              href={`https://wa.me/${WA_DIGITS}`}
              external
            />
            <ContactRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={EMAIL}
              href={`mailto:${EMAIL}`}
            />
            <ContactRow
              icon={<Instagram className="h-4 w-4" />}
              label="Instagram"
              value="@artistry_by_marium"
              href={INSTAGRAM}
              external
            />
            <ContactRow
              icon={<Facebook className="h-4 w-4" />}
              label="Facebook"
              value="Visit our page"
              href={FACEBOOK}
              external
            />
          </ul>

          <a
            href={`https://wa.me/${WA_DIGITS}`}
            target="_blank"
            rel="noreferrer"
            className="btn-gold mt-8 w-full"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-full bg-[color:var(--gold)]/15 grid place-items-center text-[color:var(--ink)] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className="text-primary hover:text-[color:var(--gold)] break-all"
        >
          {value}
        </a>
      </div>
    </li>
  );
}
