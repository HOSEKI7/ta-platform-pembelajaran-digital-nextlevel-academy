"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Masukkan email yang valid"),
});
type Values = z.infer<typeof schema>;

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit(_values: Values) {
    void _values;
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Terima kasih sudah berlangganan!", {
      description: "Kabar terbaru NextLevel akan mampir ke inbox kamu.",
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2" noValidate>
      <div className="group relative flex items-center overflow-hidden rounded-full bg-white pl-4 pr-1 ring-1 ring-zinc-200 transition focus-within:ring-[color:var(--color-brand-400)]">
        <input
          {...register("email")}
          type="email"
          placeholder="email@kamu.com"
          aria-label="Email untuk newsletter"
          className="h-11 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label="Berlangganan"
          className="inline-flex size-9 items-center justify-center rounded-full bg-[color:var(--color-brand-500)] text-white shadow-[0_8px_20px_-8px_rgba(43,114,234,0.7)] transition hover:bg-[color:var(--color-brand-600)] disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" strokeWidth={2.4} />
          )}
        </button>
      </div>
      {errors.email ? (
        <p className="px-2 text-xs text-[color:var(--color-error)]">{errors.email.message}</p>
      ) : (
        <p className="px-2 text-xs text-zinc-500">Insight, kursus baru, dan diskon. Tanpa spam.</p>
      )}
    </form>
  );
}
