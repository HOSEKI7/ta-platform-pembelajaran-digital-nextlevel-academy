"use client";

import { useRef } from "react";
import { ImageOff, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import type { BadgeIconOption } from "@/lib/badge-icons";
import { type BadgeTriggerKey } from "@/lib/gamification-types";
import { cn } from "@/lib/utils";
import { useBadgeIconUploadMutation } from "@/hooks/use-badge-icon-upload";

import { BadgeIcon } from "./badge-icon";

/** Icon selection value: raw stored path + a displayable preview URL. */
export type BadgeIconValue = {
  stored: string | null;
  preview: string | null;
};

type Props = {
  value: BadgeIconValue;
  onChange: (value: BadgeIconValue) => void;
  presets: BadgeIconOption[];
  /** For the text-fallback preview when no icon is chosen. */
  trigger: BadgeTriggerKey;
  threshold: number;
};

/**
 * Badge icon picker (PRD §6.11.8) — choose a preset (like avatar selection),
 * upload a custom image (Bunny Storage), or use no icon (text-based medallion
 * fallback per trigger).
 */
export function BadgeIconPicker({
  value,
  onChange,
  presets,
  trigger,
  threshold,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const upload = useBadgeIconUploadMutation();

  const handleUpload = (file: File) => {
    upload.mutate(file, {
      onSuccess: (data) => onChange({ stored: data.path, preview: data.url }),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal mengunggah ikon.",
        ),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <BadgeIcon
          logoUrl={value.preview}
          trigger={trigger}
          threshold={threshold}
          size="lg"
        />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={upload.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              {upload.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" strokeWidth={2.4} />
              )}
              Unggah ikon
            </button>
            <button
              type="button"
              onClick={() => onChange({ stored: null, preview: null })}
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-zinc-50 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-white/5"
            >
              <ImageOff className="size-3.5" strokeWidth={2.4} />
              Tanpa ikon
            </button>
          </div>
          <p className="text-[11px] text-zinc-400">
            PNG/JPG/WEBP/GIF, maks 5 MB. Tanpa ikon memakai lambang default
            trigger.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {presets.length > 0 ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
            Pilih dari ikon tersedia
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const selected = value.stored === p.src;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange({ stored: p.src, preview: p.src })}
                  title={p.label}
                  className={cn(
                    "grid size-12 place-items-center rounded-2xl bg-white p-1 ring-1 transition hover:ring-[color:var(--color-brand-400)] dark:bg-white/5",
                    selected
                      ? "ring-2 ring-[color:var(--color-brand-500)]"
                      : "ring-zinc-200 dark:ring-white/10",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt={p.label}
                    className="size-full rounded-xl object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
