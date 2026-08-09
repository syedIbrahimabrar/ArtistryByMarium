import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Used as default categories on first-time application setup. */
export const DEFAULT_CATEGORIES = [
  "Canvas Paintings",
  "Customized Paintings",
  "Handmade Artwork",
  "Gift Bouquets",
  "Bookmarks",
  "Special Creations",
];

type CategoryResult = { error?: string };

const SEED_KEY = "artistry_categories_seeded_v2";

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_categories")
        .select("name")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!error && Array.isArray(data)) {
        const unique = Array.from(
          new Set(data.map((row) => row.name).filter((n): n is string => Boolean(n))),
        );

        if (unique.length > 0) {
          setCategories(unique);
          if (typeof window !== "undefined") {
            localStorage.setItem(SEED_KEY, "true");
          }
        } else {
          // If 0 categories found, check if initialized before
          const isSeeded =
            typeof window !== "undefined" && localStorage.getItem(SEED_KEY) === "true";
          if (!isSeeded) {
            // First run: seed defaults once
            if (typeof window !== "undefined") {
              localStorage.setItem(SEED_KEY, "true");
            }
            for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
              await supabase
                .from("gallery_categories")
                .insert({ name: DEFAULT_CATEGORIES[i], sort_order: i });
            }
            setCategories(DEFAULT_CATEGORIES);
          } else {
            // User intentionally deleted all categories
            setCategories([]);
          }
        }
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch {
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("gallery_categories_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gallery_categories" },
          load,
        );
      channel.subscribe();
    } catch {
      // Ignore realtime subscribe errors
    }
    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // Ignore channel cleanup errors
        }
      }
    };
  }, [load]);

  const addCategory = useCallback(
    async (name: string): Promise<CategoryResult> => {
      const trimmed = name.trim();
      if (!trimmed) return { error: "Please enter a category name" };

      if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
        return { error: "Category already exists" };
      }

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(SEED_KEY, "true");
        }
        const { error } = await supabase
          .from("gallery_categories")
          .insert({ name: trimmed, sort_order: categories.length });

        if (error) {
          return { error: error.code === "23505" ? "Category already exists" : error.message };
        }
        await load();
        return {};
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to add category";
        return { error: msg };
      }
    },
    [categories, load],
  );

  const deleteCategory = useCallback(
    async (name: string): Promise<CategoryResult> => {
      const trimmed = name.trim();
      if (!trimmed) return {};

      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(SEED_KEY, "true");
        }
        const { error } = await supabase.from("gallery_categories").delete().eq("name", trimmed);
        if (error) {
          console.warn("Category deletion error:", error);
        }

        // Optimistically remove from state case-insensitively
        setCategories((prev) =>
          prev.filter((c) => c.trim().toLowerCase() !== trimmed.toLowerCase()),
        );
        await load();
        return {};
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete category";
        return { error: msg };
      }
    },
    [load],
  );

  return { categories, loading, addCategory, deleteCategory, refresh: load };
}
