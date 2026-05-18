import { cn } from "@/lib/utils";

/**
 * Corner ribbon overlay — diagonal "Dimiliki" stamp in the top-right of an
 * owned course card. Designed to sit inside a parent with `overflow-hidden`
 * (the card's thumbnail wrapper) so the banner ends get clipped at the
 * card edges.
 */
export function CatalogOwnedRibbon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute right-0 top-0 z-20 h-28 w-28 overflow-hidden",
        className,
      )}
    >
      <span className="absolute -right-11 top-5 inline-block w-44 -translate-y-px rotate-45 transform bg-[color:var(--color-brand-accent)] py-1.5 text-center font-heading text-[10px] font-extrabold uppercase tracking-[0.22em] text-[color:var(--color-brand-900)] shadow-[0_8px_18px_-8px_rgba(244,214,0,0.7)] ring-1 ring-[color:var(--color-brand-900)]/10">
        Dimiliki
      </span>
      {/* Tiny dark "fold" anchors on the inner ribbon edges for the ribbon silhouette. */}
      <span className="absolute right-0 top-[3.4rem] h-1.5 w-1.5 rotate-45 bg-[color:var(--color-brand-700)]/30" />
      <span className="absolute right-[3.4rem] top-0 h-1.5 w-1.5 rotate-45 bg-[color:var(--color-brand-700)]/30" />
    </span>
  );
}

/**
 * Accessible companion — adds an off-screen label so screen readers announce
 * the owned state. Render alongside `CatalogOwnedRibbon`.
 */
export function CatalogOwnedSrLabel() {
  return <span className="sr-only">Sudah dimiliki.</span>;
}
