/**
 * Utility functions for handling image and video media URLs and files.
 */

export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (lower.startsWith("data:video/")) return true;
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".m4v") ||
    lower.includes("/video/") ||
    lower.includes("video_")
  ) {
    return true;
  }
  return false;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Fast client-side image compressor.
 * Resizes photos to max 1600px dimension and converts to compressed JPEG/WEBP.
 * Prevents multi-megabyte camera photos from causing network lags or browser freezing.
 */
export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<File> {
  if (!file || !file.type.startsWith("image/")) return file;
  if (file.type === "image/gif") return file; // Preserve animated GIFs

  // If already under 200KB, no need to re-compress
  if (file.size < 200 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          if (blob.size < file.size) {
            const ext = mimeType === "image/png" ? "png" : "jpg";
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            const newName = `${cleanName}_opt.${ext}`;
            const compressedFile = new File([blob], newName, { type: mimeType });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        mimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
