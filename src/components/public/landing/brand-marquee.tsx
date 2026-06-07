const ITEMS = [
  "EXP",
  "NAIK LEVEL",
  "SERTIFIKAT RESMI",
  "MAGANG TERINTEGRASI",
  "AKSES SEUMUR HIDUP",
  "BELAJAR DENGAN PACE KAMU",
];

/**
 * Slim infinite brand marquee. CSS-only (transform translateX, GPU-friendly):
 * the track is duplicated and shifted -50% so the loop is seamless. Pauses on
 * hover; goes static under `prefers-reduced-motion` (see globals.css).
 */
export function BrandMarquee() {
  return (
    <section className="relative py-4" aria-hidden>
      <div
        className="group relative overflow-hidden border-y border-[color:var(--color-brand-100)] bg-[color:var(--color-brand-50)]/60 py-3.5"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)",
        }}
      >
        <div className="landing-marquee-track flex w-max items-center gap-10 whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-10" aria-hidden={dup === 1}>
              {ITEMS.map((item) => (
                <div key={`${dup}-${item}`} className="flex items-center gap-10">
                  <span className="font-heading text-sm font-extrabold uppercase tracking-[0.22em] text-[color:var(--color-brand-800)]">
                    {item}
                  </span>
                  <span className="size-1.5 shrink-0 rounded-full bg-[color:var(--color-brand-accent)] shadow-[0_0_10px_var(--color-brand-accent)]" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
