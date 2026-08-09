import React, { useRef, useState } from "react";
import {
  Upload,
  Link as LinkIcon,
  Video,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  Smartphone,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { isVideoUrl, formatFileSize, compressImage } from "@/lib/media";
import { uploadFile } from "@/lib/storage";

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export function MediaUploader({
  value,
  onChange,
  label = "Artwork Media (Image or Video)",
  description = "Upload an image or video directly from your phone/laptop, or paste a URL.",
  required = false,
  className = "",
}: MediaUploaderProps) {
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = isVideoUrl(value);

  async function handleFileSelect(file: File | null) {
    if (!file) return;

    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");

    if (!isImg && !isVid) {
      toast.error("Please upload an image (JPG, PNG, WEBP, etc.) or video (MP4, WEBM, MOV, etc.)");
      return;
    }

    // Limit size to 40MB for videos/files
    if (file.size > 40 * 1024 * 1024) {
      toast.error("File size is larger than 40MB. Please choose a smaller file.");
      return;
    }

    setUploading(true);

    try {
      // Compress images client-side for fast network transfer & no website lag
      const targetFile = isImg ? await compressImage(file) : file;

      setFileName(targetFile.name);
      setFileSize(targetFile.size);

      // Best effort upload via storage service
      const res = await uploadFile("gallery", targetFile, "media/");
      if ("error" in res) {
        // Fallback to FileReader Data URL if storage fails or for offline support
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          onChange(dataUrl);
          toast.success(`${isVid ? "Video" : "Image"} ready to save!`);
          setUploading(false);
        };
        reader.onerror = () => {
          toast.error("Failed to read file from device");
          setUploading(false);
        };
        reader.readAsDataURL(targetFile);
      } else {
        onChange(res.path);
        toast.success(`${isVid ? "Video" : "Image"} uploaded successfully!`);
        setUploading(false);
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback read
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
        toast.success(`${isVid ? "Video" : "Image"} ready!`);
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Upload failed");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleClear() {
    onChange("");
    setFileName(null);
    setFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-primary">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
          {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>

        {/* Input Method Tabs */}
        <div className="inline-flex rounded-lg bg-secondary/80 p-0.5 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              activeTab === "file"
                ? "bg-background text-primary shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3 w-3" />
            Device / Laptop File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("url")}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
              activeTab === "url"
                ? "bg-background text-primary shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            Direct URL
          </button>
        </div>
      </div>

      {/* Preview Section if Value exists */}
      {value ? (
        <div className="relative group rounded-xl border border-primary/20 bg-card p-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative aspect-video sm:w-40 w-full rounded-lg overflow-hidden bg-black/90 flex items-center justify-center shrink-0 border border-border">
              {isVideo ? (
                <video src={value} controls playsInline className="w-full h-full object-contain" />
              ) : (
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if URL fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              )}
              <span
                className={`absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                  isVideo ? "bg-amber-500 text-white" : "bg-primary text-primary-foreground"
                }`}
              >
                {isVideo ? (
                  <span className="flex items-center gap-1">
                    <Video className="h-2.5 w-2.5" /> Video
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ImageIcon className="h-2.5 w-2.5" /> Image
                  </span>
                )}
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1 text-left w-full">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">
                  {fileName ? fileName : isVideo ? "Video Loaded" : "Image Loaded"}
                </span>
              </div>

              {fileSize && (
                <p className="text-[11px] text-muted-foreground">
                  Size: {formatFileSize(fileSize)}
                </p>
              )}

              <p className="text-[10px] text-muted-foreground/80 font-mono break-all line-clamp-1">
                {value.length > 80 ? value.substring(0, 80) + "..." : value}
              </p>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Replace File
                </button>
                <span className="text-muted-foreground/40">•</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-destructive hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "file" ? (
        /* File Dropzone for Mobile & Desktop */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border hover:border-primary/50 hover:bg-secondary/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="hidden"
          />

          {uploading ? (
            <div className="py-4 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-xs font-medium text-primary">Processing and attaching file...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center items-center gap-2 text-primary/70">
                <div className="p-2.5 rounded-full bg-secondary border border-border">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div className="p-3 rounded-full bg-primary/10 border border-primary/20 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="p-2.5 rounded-full bg-secondary border border-border">
                  <Laptop className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-primary">
                  Tap to upload from Mobile Device or Drag & Drop from Laptop
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Supports Images (JPG, PNG, WEBP, GIF) and Videos (MP4, WEBM, MOV)
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground border border-border/60">
                <span>Supports Photo Library, Camera & Files</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Direct URL Input */
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://example.com/artwork.jpg or https://.../video.mp4"
              required={required}
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
            />
            <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Direct web URL to an image or video file.
          </p>
        </div>
      )}
    </div>
  );
}
