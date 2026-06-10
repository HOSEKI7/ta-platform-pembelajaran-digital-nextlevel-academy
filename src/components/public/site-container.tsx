import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
};

export function SiteContainer({ children, className, as = "div" }: Props) {
  const Tag = as;
  return (
    <Tag
      className={cn(
        // Max width grows in steps THROUGH the large band so content tracks the
        // viewport instead of staying pinned at 1280 until 1920 (which reads as
        // "marooned"/zoomed-out on 1440–2560 screens). Gutters scale fluidly.
        // The public navbar mirrors these exact caps so its edges stay aligned.
        // All caps use arbitrary `min-[]` so Tailwind sorts them numerically
        // (a named `2xl:` would otherwise override the wider arbitrary steps
        // regardless of source order).
        "mx-auto w-full max-w-7xl px-[clamp(1.25rem,4vw,2.5rem)] min-[1280px]:max-w-[1360px] min-[1536px]:max-w-[1480px] min-[1920px]:max-w-[1600px] min-[1920px]:px-14 min-[2560px]:max-w-[1840px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
