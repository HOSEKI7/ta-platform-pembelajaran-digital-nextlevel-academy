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
        // Default cap at 1280px keeps 1920×1080 layouts comfortably dense.
        // On ≥1920px viewports (2K / QHD / ultrawide) we let the shell breathe
        // out to 1480px so the page doesn't feel marooned in negative space.
        "mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10 min-[1920px]:max-w-[1480px] min-[1920px]:px-14",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
