import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Inbox,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Trash2,
  Check,
  Clock,
  Loader2,
  ExternalLink,
  Eye,
  X,
  Lock,
  LogOut,
  RefreshCw,
  Sparkles,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/lib/categories";
import { MediaUploader } from "@/components/MediaUploader";
import { isVideoUrl } from "@/lib/media";

export const Route = createFileRoute("/welcome100")({
  component: Welcome100AdminPage,
});

type Tab = "overview" | "requests" | "gallery" | "messages";

interface RequestRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  size: string | null;
  budget: string | null;
  description: string;
  status: string;
  created_at: string;
}

interface GalleryRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
  price: string | null;
  featured: boolean | null;
  status: string | null;
  created_at: string;
}

interface Msg {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean | null;
  created_at: string;
}

function Welcome100AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user);
        setIsUnlocked(true);
      }
    });
  }, []);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setVerifyingPassword(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "Syeda.m462006@gmail.com",
        password: passwordInput.trim(),
      });
      if (error) {
        toast.error("Incorrect password. Access denied.");
        setPasswordInput("");
      } else {
        toast.success("Admin panel unlocked");
        setCurrentUser(data.user);
        setIsUnlocked(true);
      }
    } catch {
      toast.error("Failed to verify password");
    } finally {
      setVerifyingPassword(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut().catch(() => {});
    setIsUnlocked(false);
    setCurrentUser(null);
    setPasswordInput("");
    toast.info("Signed out");
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[color:var(--cream)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl text-center">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl text-primary mb-2">Admin Panel Lock</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the admin password to access the dashboard.
          </p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Admin Password"
                autoFocus
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={verifyingPassword || !passwordInput.trim()}
              className="w-full btn-ink py-3 text-sm font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {verifyingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Unlock Admin Panel
            </button>
          </form>
          <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground underline">
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Inbox }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "requests", label: "Requests", icon: Inbox },
    { id: "gallery", label: "Gallery & Categories", icon: ImageIcon },
    { id: "messages", label: "Messages", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--cream)] text-foreground">
      {/* Admin Subheader */}
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="container-art py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-primary">
              Admin Portal
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              /welcome100
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsUnlocked(false);
                setPasswordInput("");
                toast.info("Admin panel locked");
              }}
              className="btn-outline-ink text-xs px-3 py-1.5"
            >
              <Lock className="h-3.5 w-3.5 mr-1" /> Lock
            </button>
            <button onClick={handleSignOut} className="btn-outline-ink text-xs px-3 py-1.5">
              <LogOut className="h-3.5 w-3.5 mr-1" /> Sign out
            </button>
          </div>
        </div>
        <div className="container-art flex gap-2 overflow-x-auto pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary/60 hover:bg-secondary text-secondary-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="container-art py-8">
        {tab === "overview" && <OverviewTab setTab={setTab} />}
        {tab === "requests" && <RequestsTab />}
        {tab === "gallery" && <GalleryTab />}
        {tab === "messages" && <MessagesTab />}
      </main>
    </div>
  );
}

function OverviewTab({ setTab }: { setTab: (t: Tab) => void }) {
  const [reqCount, setReqCount] = useState<number>(0);
  const [galleryCount, setGalleryCount] = useState<number>(0);
  const [msgCount, setMsgCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r, g, m] = await Promise.all([
          supabase.from("artwork_requests").select("id", { count: "exact", head: true }),
          supabase.from("gallery_items").select("id", { count: "exact", head: true }),
          supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        ]);
        setReqCount(r.count || 0);
        setGalleryCount(g.count || 0);
        setMsgCount(m.count || 0);
      } catch {
        // quiet fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-primary">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">
            Manage your studio artworks and incoming inquiries.
          </p>
        </div>
        <Link to="/gallery" className="btn-outline-ink text-xs inline-flex items-center gap-1">
          <ExternalLink className="h-3.5 w-3.5" /> Live Store Gallery
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setTab("requests")}
          className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Artwork Requests
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-primary">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : reqCount}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Custom commission requests from clients
          </p>
        </div>

        <div
          onClick={() => setTab("gallery")}
          className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Gallery Artworks
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <ImageIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-primary">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : galleryCount}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Paintings & portfolio items listed</p>
        </div>

        <div
          onClick={() => setTab("messages")}
          className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Contact Messages
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-display font-bold text-primary">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : msgCount}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Inquiries from website contact form</p>
        </div>
      </div>
    </div>
  );
}

function RequestsTab() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("artwork_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);

      setRows((data as RequestRow[]) || []);
    } catch {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    try {
      const { error } = await supabase.from("artwork_requests").update({ status }).eq("id", id);
      if (error) return toast.error(error.message);
      toast.success(`Marked as ${status}`);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    }
  }

  async function del(id: string) {
    try {
      const { error } = await supabase.from("artwork_requests").delete().eq("id", id);
      if (error) return toast.error(error.message);
      toast.success("Deleted request");
      setDeletingId(null);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete request";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold text-primary">Custom Artwork Requests</h2>
        <button onClick={load} className="btn-outline-ink text-xs inline-flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading requests...
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
          No artwork requests submitted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {r.name}
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        r.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : r.status === "in_progress"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {r.status || "pending"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span>
                      Email:{" "}
                      <a href={`mailto:${r.email}`} className="underline">
                        {r.email}
                      </a>
                    </span>
                    {r.phone && <span>Phone: {r.phone}</span>}
                    {r.size && <span>Size: {r.size}</span>}
                    {r.budget && <span>Budget: {r.budget}</span>}
                    <span>Date: {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {r.status !== "completed" ? (
                    <button
                      onClick={() => setStatus(r.id, "completed")}
                      className="text-xs btn-ink px-2.5 py-1 rounded-lg"
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <button
                      onClick={() => setStatus(r.id, "pending")}
                      className="text-xs btn-outline-ink px-2.5 py-1 rounded-lg"
                    >
                      Reopen
                    </button>
                  )}
                  {deletingId === r.id ? (
                    <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 text-xs px-2.5 py-1 rounded-full">
                      <span>Delete?</span>
                      <button onClick={() => del(r.id)} className="font-semibold underline">
                        Yes
                      </button>
                      <button onClick={() => setDeletingId(null)} className="opacity-70">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(r.id)}
                      className="text-xs text-destructive inline-flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-secondary/30 p-3 rounded-xl border border-border/40">
                {r.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryTab() {
  const { categories, addCategory, removeCategory } = useCategories();
  const [rows, setRows] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Item form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Category management
  const [newCat, setNewCat] = useState("");
  const [addingCat, setAddingCat] = useState(false);
  const [deletingCatName, setDeletingCatName] = useState<string | null>(null);
  const [deletingCatBusy, setDeletingCatBusy] = useState<string | null>(null);
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setRows((data as GalleryRow[]) || []);
    } catch {
      toast.error("Failed to fetch gallery items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]);
    }
  }, [categories, category]);

  async function handleAddGalleryItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      return toast.error("Please fill in Title and Image URL");
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("gallery_items").insert({
        title: title.trim(),
        category: category || categories[0] || "Calligraphy",
        price: price.trim() || null,
        image_url: imageUrl.trim(),
        featured,
        status: "available",
      });
      if (error) return toast.error(error.message);
      toast.success("Artwork added to gallery");
      setTitle("");
      setPrice("");
      setImageUrl("");
      setFeatured(false);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add artwork";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleFeatured(r: GalleryRow) {
    try {
      const newFeatured = !r.featured;
      const { error } = await supabase
        .from("gallery_items")
        .update({ featured: newFeatured })
        .eq("id", r.id);
      if (error) return toast.error(error.message);
      toast.success(newFeatured ? "Featured on homepage" : "Unfeatured from homepage");
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      toast.error(msg);
    }
  }

  async function del(r: GalleryRow) {
    try {
      const { error } = await supabase.from("gallery_items").delete().eq("id", r.id);
      if (error) return toast.error(error.message);
      toast.success("Deleted artwork");
      setDeletingGalleryId(null);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete item";
      toast.error(msg);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCat.trim()) return;
    setAddingCat(true);
    try {
      const { error } = await addCategory(newCat.trim());
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Category "${newCat.trim()}" added`);
        setNewCat("");
      }
    } finally {
      setAddingCat(false);
    }
  }

  async function confirmDeleteCategory(cat: string) {
    setDeletingCatBusy(cat);
    try {
      const { error } = await removeCategory(cat);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(`Category "${cat}" deleted`);
      setDeletingCatName(null);
    } finally {
      setDeletingCatBusy(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Category Management Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-display font-semibold text-primary mb-1">Gallery Categories</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Manage categories used across the gallery filter tabs and custom request options.
        </p>

        <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="New Category Name (e.g. Modern Canvas)"
            className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={addingCat || !newCat.trim()}
            className="btn-ink text-xs px-4 py-2 rounded-xl flex items-center gap-1 disabled:opacity-50"
          >
            {addingCat ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((c) =>
            deletingCatName === c ? (
              <span
                key={c}
                className="inline-flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 text-xs px-3 py-1.5 rounded-full"
              >
                <span>Delete {c}?</span>
                <button
                  onClick={() => confirmDeleteCategory(c)}
                  disabled={deletingCatBusy === c}
                  className="font-semibold underline hover:text-destructive/80 disabled:opacity-50"
                >
                  {deletingCatBusy === c ? "Deleting…" : "Confirm"}
                </button>
                <button
                  onClick={() => setDeletingCatName(null)}
                  className="opacity-70 hover:opacity-100 ml-1"
                  aria-label="Cancel"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : (
              <span
                key={c}
                className="inline-flex items-center gap-1 bg-secondary text-primary text-xs px-3 py-1.5 rounded-full"
              >
                {c}
                <button
                  onClick={() => setDeletingCatName(c)}
                  aria-label={`Delete ${c}`}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ),
          )}
        </div>
      </div>

      {/* Add New Artwork Form */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-display font-semibold text-primary mb-4">Add New Artwork</h3>
        <form onSubmit={handleAddGalleryItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Surah Ar-Rahman Canvas"
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <MediaUploader
              value={imageUrl}
              onChange={setImageUrl}
              label="Artwork Media (Image or Video) *"
              description="Upload directly from your mobile camera/gallery or laptop files, or enter a direct URL."
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Price / Price Note (Optional)
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. $250 or Upon Request"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary/20 h-4 w-4"
              />
              Feature this artwork on the Homepage
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="btn-ink text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Publish Artwork
            </button>
          </div>
        </form>
      </div>

      {/* Gallery Items List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold text-primary">
            Existing Artworks ({rows.length})
          </h3>
          <button onClick={load} className="btn-outline-ink text-xs inline-flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading artworks...
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            No artworks added yet. Add one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((r) => {
              const isVideo = isVideoUrl(r.image_url);
              return (
                <div
                  key={r.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {isVideo ? (
                        <video
                          src={r.image_url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={r.image_url}
                          alt={r.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80";
                          }}
                        />
                      )}
                      {isVideo && (
                        <span className="absolute top-2 right-2 bg-black/80 text-white backdrop-blur-sm text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Video className="h-3 w-3 text-amber-400" /> Video
                        </span>
                      )}
                      {r.featured && (
                        <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                          <Sparkles className="h-3 w-3" /> Featured
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-muted-foreground uppercase font-medium tracking-wider mb-1">
                        {r.category}
                      </div>
                      <div className="font-display font-semibold text-foreground text-base mb-1">
                        {r.title}
                      </div>
                      {r.price && (
                        <div className="text-xs font-semibold text-primary">{r.price}</div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-border/40 mt-2 flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleFeatured(r)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {r.featured ? "Unfeature" : "Feature on Home"}
                    </button>

                    {deletingGalleryId === r.id ? (
                      <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 text-xs px-2.5 py-1 rounded-full">
                        <span>Delete?</span>
                        <button onClick={() => del(r)} className="font-semibold underline">
                          Yes
                        </button>
                        <button onClick={() => setDeletingGalleryId(null)} className="opacity-70">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingGalleryId(r.id)}
                        className="text-destructive hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesTab() {
  const [rows, setRows] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setRows((data as Msg[]) || []);
    } catch {
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRead(m: Msg) {
    try {
      const newRead = !m.read;
      const { error } = await supabase
        .from("contact_messages")
        .update({ read: newRead })
        .eq("id", m.id);
      if (error) return toast.error(error.message);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update";
      toast.error(msg);
    }
  }

  async function del(id: string) {
    try {
      await supabase.from("contact_messages").delete().eq("id", id);
      toast.success("Deleted message");
      setDeletingId(null);
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete message";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-semibold text-primary">Contact Form Messages</h2>
        <button onClick={load} className="btn-outline-ink text-xs inline-flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading messages...
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
          No contact messages received yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((m) => (
            <div
              key={m.id}
              className={`bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3 ${
                !m.read ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {m.name}
                    {!m.read && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span>
                      Email:{" "}
                      <a href={`mailto:${m.email}`} className="underline">
                        {m.email}
                      </a>
                    </span>
                    {m.subject && <span>Subject: {m.subject}</span>}
                    <span>Date: {new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => toggleRead(m)}
                    className="text-xs btn-outline-ink px-2.5 py-1 rounded-lg"
                  >
                    {m.read ? "Mark Unread" : "Mark Read"}
                  </button>

                  {deletingId === m.id ? (
                    <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 text-xs px-2.5 py-1 rounded-full">
                      <span>Delete?</span>
                      <button onClick={() => del(m.id)} className="font-semibold underline">
                        Yes
                      </button>
                      <button onClick={() => setDeletingId(null)} className="opacity-70">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(m.id)}
                      className="text-xs text-destructive inline-flex items-center gap-1 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>

              <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-secondary/30 p-3 rounded-xl border border-border/40">
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
