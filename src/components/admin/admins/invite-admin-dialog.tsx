"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Loader2, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import {
  inviteAdminSchema,
  type InviteAdminInput,
} from "@/lib/validations/admin-invite";
import { useInviteAdminMutation } from "@/hooks/use-admin-account-actions";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/courses/form/field";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Whether the platform already exceeds the recommended admin count. */
  tooManyAdmins: boolean;
};

export function InviteAdminDialog({
  open,
  onOpenChange,
  tooManyAdmins,
}: Props) {
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteAdminInput>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: "", name: "" },
  });

  const inviteMutation = useInviteAdminMutation();
  const submitting = inviteMutation.isPending;

  function closeAndReset(next: boolean) {
    if (submitting) return;
    if (!next) {
      reset({ email: "", name: "" });
      setCreatedUrl(null);
      setSentEmail(null);
      setCopied(false);
    }
    onOpenChange(next);
  }

  const onValid = (values: InviteAdminInput) => {
    inviteMutation.mutate(
      { email: values.email, name: values.name || undefined },
      {
        onSuccess: (data) => {
          setSentEmail(values.email);
          if (data.inviteUrl) {
            setCreatedUrl(data.inviteUrl);
            toast.success(
              "Undangan dibuat. Salin tautannya untuk dikirim manual.",
            );
          } else {
            toast.success("Undangan terkirim ke email.");
          }
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Gagal mengirim undangan.",
          ),
      },
    );
  };

  async function copyUrl() {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin. Salin manual dari kotak di atas.");
    }
  }

  const done = sentEmail !== null;

  return (
    <Dialog open={open} onOpenChange={closeAndReset}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <Mail className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>Undang Administrator</DialogTitle>
          <DialogDescription>
            Kirim undangan via email. Penerima membuat akun dan menetapkan
            password sendiri. Tautan berlaku 24 jam dan hanya sekali pakai.
          </DialogDescription>
        </DialogHeader>

        {tooManyAdmins && !done ? (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 px-3.5 py-3 text-xs text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" strokeWidth={2.2} />
            <p>
              Jumlah administrator aktif sudah melebihi 5. Menambah admin lagi
              memperbesar risiko keamanan, privasi, dan kontrol data berlebih.
              Pastikan undangan ini memang diperlukan.
            </p>
          </div>
        ) : null}

        {done ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Undangan untuk{" "}
              <span className="font-semibold text-foreground">{sentEmail}</span>{" "}
              berhasil dibuat.
            </p>
            {createdUrl ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Email tidak terkirim otomatis (RESEND tidak dikonfigurasi).
                  Salin tautan ini dan kirim ke penerima:
                </p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-white/5 dark:text-zinc-200">
                    {createdUrl}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyUrl}
                  >
                    {copied ? (
                      <Check className="size-4" strokeWidth={2.4} />
                    ) : (
                      <Copy className="size-4" strokeWidth={2.4} />
                    )}
                    {copied ? "Tersalin" : "Salin"}
                  </Button>
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" onClick={() => closeAndReset(false)}>
                Selesai
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onValid)}
            className="flex flex-col gap-5"
          >
            <Field
              label="Email"
              htmlFor="invite-email"
              error={errors.email?.message}
            >
              <Input
                id="invite-email"
                type="email"
                autoComplete="off"
                placeholder="nama@email.com"
                className="h-11 rounded-xl"
                disabled={submitting}
                autoFocus
                {...register("email")}
              />
            </Field>
            <Field
              label="Nama"
              htmlFor="invite-name"
              optional
              hint="Penerima dapat mengubahnya saat menerima undangan."
              error={errors.name?.message}
            >
              <Input
                id="invite-name"
                placeholder="Nama administrator"
                className="h-11 rounded-xl"
                disabled={submitting}
                {...register("name")}
              />
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => closeAndReset(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
                ) : null}
                {submitting ? "Mengirim…" : "Kirim Undangan"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
