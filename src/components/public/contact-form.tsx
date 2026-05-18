"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  subject: z.string().min(3, "Subjek minimal 3 karakter"),
  message: z.string().min(10, "Pesan minimal 10 karakter"),
});
type Values = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(_values: Values) {
    void _values;
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Pesan terkirim", {
      description: "Terima kasih! Tim kami akan menghubungi balik dalam 1 hari kerja.",
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama lengkap" error={errors.name?.message}>
          <Input
            {...register("name")}
            placeholder="Nama kamu"
            className="h-11 rounded-xl border-zinc-200 bg-white text-sm focus-visible:ring-[color:var(--color-brand-400)]"
          />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input
            {...register("email")}
            type="email"
            placeholder="email@kamu.com"
            className="h-11 rounded-xl border-zinc-200 bg-white text-sm focus-visible:ring-[color:var(--color-brand-400)]"
          />
        </Field>
      </div>

      <Field label="Subjek" error={errors.subject?.message}>
        <Input
          {...register("subject")}
          placeholder="Ada yang bisa kami bantu?"
          className="h-11 rounded-xl border-zinc-200 bg-white text-sm focus-visible:ring-[color:var(--color-brand-400)]"
        />
      </Field>

      <Field label="Pesan" error={errors.message?.message}>
        <Textarea
          {...register("message")}
          rows={5}
          placeholder="Tulis pesan kamu di sini…"
          className="resize-none rounded-xl border-zinc-200 bg-white text-sm focus-visible:ring-[color:var(--color-brand-400)]"
        />
      </Field>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 gap-2 rounded-full bg-[color:var(--color-brand-500)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(43,114,234,0.7)] hover:bg-[color:var(--color-brand-600)]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Mengirim…
          </>
        ) : (
          <>
            <Send className="size-4" /> Kirim pesan
          </>
        )}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-[color:var(--color-error)]">{error}</p>
      ) : null}
    </div>
  );
}
