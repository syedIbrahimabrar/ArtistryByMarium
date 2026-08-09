import { supabase } from "@/integrations/supabase/client";

/** Returns a long-lived signed URL for a private storage object, or null on error. */
export async function signedUrl(
  bucket: string,
  path: string,
  expiresIn = 60 * 60 * 24 * 7, // 1 week
): Promise<string | null> {
  if (!path) return null;
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error || !data) return null;
    return data.signedUrl;
  } catch (err) {
    console.error("Signed URL error:", err);
    return null;
  }
}

/** Best-effort upload helper. Returns the storage path (not URL). */
export async function uploadFile(
  bucket: string,
  file: File,
  prefix = "",
): Promise<{ path: string } | { error: string }> {
  const ext = file.name.split(".").pop() ?? "bin";
  const name = `${prefix}${crypto.randomUUID()}.${ext}`;
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(name, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error || !data) return { error: error?.message ?? "upload failed" };
    return { path: data.path };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload failed: network error";
    return { error: msg };
  }
}
