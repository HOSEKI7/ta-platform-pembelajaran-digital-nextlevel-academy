import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "main";
};

export function SiteContainer({ children, className, as = "div" }: Props) {
  const Tag = as;
  return (
    <Tag className={cn("mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10", className)}>
      {children}
    </Tag>
  );
}
