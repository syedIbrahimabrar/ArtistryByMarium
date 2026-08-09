import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";

export const Route = createFileRoute("/request")({
  head: () => ({
    meta: [
      { title: "Request Custom Artwork — Artistry by Marium" },
      {
        name: "description",
        content:
          "Upload a reference image and request a custom hand-painted artwork, bookmark or gift bouquet.",
      },
      { property: "og:title", content: "Custom Artwork Request" },
      {
        property: "og:description",
        content: "Send us your reference image and we'll bring it to life.",
      },
    ],
  }),
  component: RequestPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().min(7, "Please enter a valid phone").max(30),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email").max(120),
  size: z.string().trim().max(60).optional().or(z.literal("")),
  instructions: z.string().trim().max(1500).optional().or(z.literal("")),
});

function RequestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  function acceptFile(f: File | null) {
    if (!f) return;
    const isImg = f.type.startsWith("image/");
    const isVid = f.type.startsWith("video/");
    if (!isImg && !isVid) {
      toast.error("Please choose an image or video file");
      return;
    }
    if (f.size > 30 * 1024 * 1024) {
      toast.error("File is larger than 30MB");
      return;
    }
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      phone: fd.get("phone"),
      whatsapp: fd.get("whatsapp") ?? "",
      email: fd.get("email"),
      size: fd.get("size") ?? "",
      instructions: fd.get("instructions") ?? "",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      let imagePath: string | null = null;
      if (file) {
        const up = await uploadFile("artwork-requests", file, "req/");
        if ("error" in up) {
          toast.error("Could not upload image: " + up.error);
          setSubmitting(false);
          return;
        }
        imagePath = up.path;
      }
      const { error } = await supabase.from("artwork_requests").insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        whatsapp: parsed.data.whatsapp || null,
        email: parsed.data.email,
        size: parsed.data.size || null,
        instructions: parsed.data.instructions || null,
        image_url: imagePath,
      });
      if (error) {
        toast.error("Could not submit: " + error.message);
        setSubmitting(false);
        return;
      }
      setDone(true);
      toast.success("Request received — we'll be in touch shortly!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      toast.error("Could not submit: " + msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteNav />
        <section className="container-art flex-1 grid place-items-center py-24">
          <div className="text-center max-w-md animate-fade-up">
            <div className="h-16 w-16 rounded-full bg-[color:var(--gold)]/20 grid place-items-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-[color:var(--ink)]" />
            </div>
            <h1 className="mt-6 font-display text-4xl text-primary">Thank you!</h1>
            <p className="mt-3 text-muted-foreground">
              Your request has been received. We'll review your reference and reply within 24 hours
              via your preferred channel.
            </p>
            <button
              onClick={() => {
                setDone(false);
                setFile(null);
                setPreview(null);
              }}
              className="btn-outline-ink mt-6"
            >
              Submit another
            </button>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <section className="container-art py-14 lg:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow">
            <span className="gold-divider" /> custom order
          </span>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl text-primary">
            Upload Your Painting Request
          </h1>
          <p className="mt-4 text-muted-foreground">
            Share a reference photo and a few details. We'll craft a one-of-a-kind piece, just for
            you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={`rounded-2xl border-2 border-dashed transition-colors p-6 bg-card ${
              dragging ? "border-[color:var(--gold)] bg-[color:var(--gold)]/5" : "border-border"
            }`}
          >
            {preview ? (
              <div className="space-y-4">
                {file?.type.startsWith("video/") ? (
                  <video
                    src={preview}
                    controls
                    playsInline
                    className="rounded-xl w-full max-h-[420px] object-contain bg-black"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="preview"
                    className="rounded-xl w-full max-h-[420px] object-contain bg-muted"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="btn-outline-ink"
                  >
                    <ImagePlus className="h-4 w-4" /> Replace media file
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (preview) URL.revokeObjectURL(preview);
                      setPreview(null);
                    }}
                    className="text-sm text-muted-foreground underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="h-14 w-14 mx-auto rounded-full bg-[color:var(--gold)]/15 grid place-items-center">
                  <Upload className="h-6 w-6 text-[color:var(--ink)]" />
                </div>
                <h3 className="mt-4 font-display text-2xl text-primary">
                  Add your reference image or video
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag & drop from laptop, pick from phone gallery/files, or record video/photo.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="btn-ink btn-ink-hover"
                  >
                    Choose file
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInput.current?.click()}
                    className="btn-outline-ink md:hidden"
                  >
                    Take photo/video
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Images & Videos (JPG, PNG, MP4, MOV) up to 30MB
                </p>
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
            />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Details */}
          <div className="card-art p-6 lg:p-8 grid gap-4">
            <Field label="Full name *" name="name" placeholder="Your full name" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone *" name="phone" type="tel" placeholder="0300 0000000" required />
              <Field label="WhatsApp" name="whatsapp" type="tel" placeholder="optional" />
            </div>
            <Field
              label="Email *"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Field label="Artwork size" name="size" placeholder="e.g. 12x16 inches" />
            <div>
              <label className="text-sm font-medium text-primary">Special instructions</label>
              <textarea
                name="instructions"
                rows={4}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/50"
                placeholder="Colours, style, frame preferences, delivery date…"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-ink btn-ink-hover disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Submitting…" : "Submit Artwork Request"}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              We never share your details. You'll receive a reply within 24 hours.
            </p>
          </div>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-primary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--gold)]/50"
      />
    </div>
  );
}
