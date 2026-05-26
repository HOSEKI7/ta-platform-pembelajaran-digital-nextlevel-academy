import { cn } from "@/lib/utils";

type Props = {
  /**
   * Content width cap.
   * - `wide` (default): grid/table surfaces — fills large monitors (max 1600px).
   * - `narrow`: form/document surfaces (settings, invoice) that read best tighter.
   */
  width?: "wide" | "narrow";
  className?: string;
  children: React.ReactNode;
};

const WIDTH_CLASS: Record<NonNullable<Props["width"]>, string> = {
  wide: "max-w-[1600px]",
  narrow: "max-w-5xl",
};

/**
 * Canonical content wrapper for every Peserta Didik surface (except the course
 * player). Single source of truth for the page gutter + max-width so the layout
 * stays consistent and easy to retune. Drop-in replacement for the old inline
 * `mx-auto … max-w-7xl …` div.
 */
export function StudentPageContainer({
  width = "wide",
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12",
        WIDTH_CLASS[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
