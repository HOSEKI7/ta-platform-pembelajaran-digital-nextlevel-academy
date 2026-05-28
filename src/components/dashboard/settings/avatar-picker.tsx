"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useUpdateProfileMutation } from "@/hooks/use-account";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  /** Currently selected avatar path, or null for initials. */
  image: string | null;
  /** Persist the choice into the parent draft (drives the live preview). */
  onImageChange: (next: string | null) => void;
  /** Full name — used for the initials fallback tile. */
  name: string;
};

function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "NL"
  );
}

export function AvatarPicker({ image, onImageChange, name }: Props) {
  const router = useRouter();
  const updateProfile = useUpdateProfileMutation();
  const busy = updateProfile.isPending;

  function selectAvatar(next: string | null) {
    if (busy) return;
    if (next === image) return; // already selected — no-op

    const previous = image;
    // Optimistic preview while the PATCH is in flight.
    onImageChange(next);

    updateProfile.mutate(
      { image: next },
      {
        onSuccess: () => {
          toast.success(
            next ? "Foto profil diperbarui." : "Foto profil dihapus.",
          );
          router.refresh();
        },
        onError: (err) => {
          onImageChange(previous);
          toast.error(err.message || "Gagal memperbarui foto profil.");
        },
      },
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
      )}
    >
      <header className="mb-5 flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
          01 · Visual
        </span>
        <h2 className="font-heading text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Foto profil
        </h2>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-300/70">
          Pilih salah satu avatar di bawah. Pilihanmu langsung tersimpan dan
          tampil di kursus, sertifikat, serta komunitas.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {/* Initials / no-photo tile */}
        <Tile
          selected={!image}
          disabled={busy}
          label="Tanpa foto"
          onClick={() => selectAvatar(null)}
        >
          <Avatar className="size-full rounded-2xl">
            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-100 text-base font-extrabold text-zinc-500 dark:from-white/10 dark:to-white/5 dark:text-zinc-300">
              {initialsOf(name)}
            </AvatarFallback>
          </Avatar>
          <span className="pointer-events-none absolute inset-x-1 bottom-1 inline-flex items-center justify-center gap-1 rounded-md bg-white/85 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-500 dark:bg-black/40 dark:text-zinc-300">
            <UserRound className="size-2.5" strokeWidth={2.6} />
            Inisial
          </span>
        </Tile>

        {AVATAR_OPTIONS.map((opt) => (
          <Tile
            key={opt.id}
            selected={image === opt.src}
            disabled={busy}
            label={opt.label}
            onClick={() => selectAvatar(opt.src)}
          >
            <Avatar className="size-full rounded-2xl">
              <AvatarImage
                src={opt.src}
                alt={opt.label}
                className="object-cover"
              />
              <AvatarFallback className="rounded-2xl bg-zinc-100 dark:bg-white/5" />
            </Avatar>
          </Tile>
        ))}
      </div>

      {busy ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.4} />
          Menyimpan pilihan…
        </p>
      ) : null}
    </section>
  );
}

type TileProps = {
  selected: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
};

function Tile({ selected, disabled, label, onClick, children }: TileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Pilih avatar ${label}`}
      title={label}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-2xl ring-1 transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-400)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "ring-2 ring-[color:var(--color-brand-500)] shadow-[0_10px_24px_-12px_rgba(43,114,234,0.7)]"
          : "ring-zinc-200 hover:ring-[color:var(--color-brand-300)] dark:ring-[color:var(--color-surface-border)] dark:hover:ring-[color:var(--color-brand-400)]/60",
      )}
    >
      {children}
      {selected ? (
        <span className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-[color:var(--color-brand-500)] text-white shadow ring-2 ring-white dark:ring-[color:var(--color-surface-card)]">
          <Check className="size-3" strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}
