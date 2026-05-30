"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  /** Initial preview (resolved URL from the server) or "" when none. */
  previewUrl?: string;
  /** Emits the chosen File, or null if never selected (keep existing). */
  onFileChange: (file: File | null) => void;
  /** "wide" → 16:9 thumbnail · "square" → 1:1 instructor avatar. */
  shape?: "wide" | "square";
  disabled?: boolean;
};

/**
 * Single-image picker with live preview (PRD §6.11.3 Thumbnail / foto
 * instruktur). Validates type/size client-side; the chosen File is uploaded by
 * the parent form's multipart submit. Choosing nothing keeps the existing image.
 */
export function ImageUploader({
  previewUrl = "",
  onFileChange,
  shape = "wide",
  disabled = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // Revoke the object URL when it changes/unmounts to avoid leaks.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const pick = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!ACCEPT.split(",").includes(file.type)) {
        toast.error("Format gambar tidak didukung. Gunakan PNG, JPG, WEBP, atau GIF.");
        return;
      }
      if (file.size > MAX_BYTES) {
        toast.error("Ukuran gambar melebihi batas 5 MB.");
        return;
      }
      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      onFileChange(file);
    },
    [onFileChange],
  );

  const shown = localPreview ?? (previewUrl || null);
  const aspect = shape === "wide" ? "aspect-video" : "aspect-square";

  return (
    <div className={cn("flex flex-col gap-2", disabled && "pointer-events-none opacity-60")}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {shown ? (
        <div className="group relative w-full max-w-sm overflow-hidden rounded-2xl ring-1 ring-zinc-200 dark:ring-[color:var(--color-surface-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shown} alt="Pratinjau" className={cn("w-full object-cover", aspect)} />
          <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 text-zinc-900 hover:bg-white"
            >
              <RefreshCw className="size-3.5" strokeWidth={2.4} />
              Ganti gambar
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full max-w-sm flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/60 px-6 text-center transition hover:border-[color:var(--color-brand-400)] hover:bg-[color:var(--color-brand-50)]/40 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02] dark:hover:border-[color:var(--color-brand-500)]/50",
            shape === "wide" ? "py-10" : "aspect-square",
          )}
        >
          <span className="grid size-11 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)]">
            <ImagePlus className="size-5" strokeWidth={2.2} />
          </span>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Pilih gambar
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <UploadCloud className="size-3.5" strokeWidth={2.2} />
            PNG, JPG, WEBP · maks 5 MB
          </span>
        </button>
      )}
    </div>
  );
}
