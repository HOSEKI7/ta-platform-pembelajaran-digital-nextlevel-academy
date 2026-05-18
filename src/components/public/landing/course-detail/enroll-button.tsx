import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type Props = {
  href: string;
};

export function EnrollButton({ href }: Props) {
  return (
    <Link
      href={href}
      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--color-brand-500)] px-7 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-brand-600)]"
    >
      <Sparkles className="size-4 text-[color:var(--color-brand-accent)]" />
      Daftar Kursus
      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
