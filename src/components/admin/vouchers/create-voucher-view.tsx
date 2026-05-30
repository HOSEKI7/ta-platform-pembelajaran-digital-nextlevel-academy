"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useCreateVoucherMutation } from "@/hooks/use-admin-voucher-form";
import type { VoucherFormInput } from "@/lib/validations/admin-voucher";

import { VoucherForm } from "./voucher-form";

export function CreateVoucherView() {
  const router = useRouter();
  const createMutation = useCreateVoucherMutation();
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = (values: VoucherFormInput) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setRedirecting(true);
        toast.success("Voucher berhasil dibuat.");
        router.push("/admin/vouchers");
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal membuat voucher.",
        ),
    });
  };

  const busy = createMutation.isPending || redirecting;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/vouchers"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="size-4" strokeWidth={2.4} />
          Kembali ke Daftar Voucher
        </Link>
        <PageHeader
          eyebrow="Admin · Manajemen Voucher"
          title="Buat"
          accent="Voucher"
          description="Buat kode voucher diskon baru. Voucher langsung aktif jika tanggal mulai dikosongkan."
        />
      </div>

      <VoucherForm
        mode="create"
        submitting={busy}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/vouchers")}
      />
    </div>
  );
}
