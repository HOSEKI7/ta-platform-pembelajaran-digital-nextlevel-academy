"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { BadgeCheck, Loader2 } from "lucide-react";

import { useClaimCertificateMutation } from "@/hooks/use-certificates";
import { recipientNameSchema } from "@/lib/validators/certificates";

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
import { Label } from "@/components/ui/label";

const claimFormSchema = z.object({ recipientName: recipientNameSchema });
type ClaimFormInput = z.infer<typeof claimFormSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseTitle: string;
  /** Current snapshot name — prefilled and editable before it locks. */
  defaultName: string;
};

/**
 * Confirmation dialog for claiming a certificate. The name is pre-filled with
 * the snapshot taken at issuance (the account name at 100%) and may be
 * corrected here — this is the LAST chance to change it. On confirm the name is
 * frozen onto the certificate (immutable afterwards) and the PNG regenerates if
 * it changed.
 */
export function ClaimCertificateDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  defaultName,
}: Props) {
  const claim = useClaimCertificateMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClaimFormInput>({
    resolver: zodResolver(claimFormSchema),
    values: { recipientName: defaultName },
  });

  function handleOpenChange(next: boolean) {
    if (!next) reset({ recipientName: defaultName });
    onOpenChange(next);
  }

  const onValid = (values: ClaimFormInput) => {
    claim.mutate(
      { courseId, recipientName: values.recipientName },
      {
        onSuccess: (result) => {
          toast.success(
            result.nameChanged
              ? "Nama dikonfirmasi. Sertifikat sedang diperbarui…"
              : `Sertifikat untuk "${courseTitle}" berhasil diklaim.`,
          );
          onOpenChange(false);
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Gagal mengklaim sertifikat.",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Klaim Sertifikat</DialogTitle>
          <DialogDescription>
            Pastikan nama lengkap di bawah ini sudah benar — nama ini akan
            tercetak permanen pada sertifikat dan{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              tidak dapat diubah lagi
            </span>{" "}
            setelah diklaim.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="cert-recipient-name"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
            >
              Nama Lengkap pada Sertifikat
            </Label>
            <Input
              id="cert-recipient-name"
              {...register("recipientName")}
              placeholder="cth. Farid Zahran"
              className="h-11 rounded-xl"
              autoFocus
            />
            {errors.recipientName ? (
              <p className="text-[11px] font-medium text-red-600">
                {errors.recipientName.message}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500">
                Mengubah nama akun nanti tidak akan mengubah sertifikat ini.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={claim.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={claim.isPending}>
              {claim.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
                  Memproses…
                </>
              ) : (
                <>
                  <BadgeCheck className="size-4" strokeWidth={2.4} />
                  Konfirmasi & Klaim
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
