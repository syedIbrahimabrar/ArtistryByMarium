import { X } from "lucide-react";
import { useEffect } from "react";
import { isVideoUrl } from "@/lib/media";

export function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string | null;
  alt?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [src, onClose]);

  if (!src) return null;
  const isVideo = isVideoUrl(src);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {isVideo ? (
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="max-h-[90vh] max-w-[92vw] rounded-xl shadow-2xl object-contain bg-black"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={src}
          alt={alt ?? ""}
          className="max-h-[90vh] max-w-[92vw] rounded-lg shadow-2xl object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
