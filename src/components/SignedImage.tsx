import { useEffect, useState } from "react";
import { signedUrl } from "@/lib/storage";
import { isVideoUrl } from "@/lib/media";

type Props = {
  bucket: string;
  path: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  controls?: boolean;
};

export function SignedImage({
  bucket,
  path,
  alt,
  className,
  loading = "lazy",
  controls = false,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!path) return;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      setSrc(path);
      return;
    }
    signedUrl(bucket, path)
      .then((u) => {
        if (mounted) setSrc(u);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [bucket, path]);

  if (!src) {
    return <div className={`bg-muted animate-pulse ${className ?? ""}`} aria-label={alt} />;
  }

  if (isVideoUrl(src)) {
    return (
      <video src={src} className={className} controls={controls} autoPlay loop muted playsInline />
    );
  }

  return <img src={src} alt={alt} className={className} loading={loading} />;
}
