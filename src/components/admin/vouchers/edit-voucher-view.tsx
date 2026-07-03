"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  useDeleteVoucherMutation,
  useSetVoucherActiveMutation,
} from "@/hooks/use-admin-voucher-actions";
import { useUpdateVoucherMutation } from "@/hooks/use-admin-voucher-form";
import type { AdminVoucherDetail } from "@/lib/admin-vouchers-query";
import type { VoucherFormInput } from "@/lib/validations/admin-voucher";

import { VoucherForm } from "./voucher-form";
import { VoucherStatusBadge } from "./voucher-status-badge";
import { DeactivateVoucherDialog } from "./deactivate-voucher-dialog";
import { DeleteVoucherDialog } from "./delete-voucher-dialog";

type Props = {
  voucher: AdminVoucherDetail;
  courses: { id: string; title: string; categoryId: string; status: string }[];
  categories: { id: string; name: string }[];
};

function toFormInput(v: AdminVoucherDetail): VoucherFormInput {
  return {
    code: v.code,
    description: v.description ?? "",
    discountType: v.discountType,
    discountPct: v.discountPct,
    discountAmount: v.discountAmount,
    maxUsage: v.maxUsage,
    startDate: v.startDate,
    endDate: v.endDate,
    allowedCourseId: v.allowedCourseId,
    allowedCategoryId: v.allowedCategoryId,
    maxOneUsePerUser: v.maxUsagePerUser === 1,
  };
}

export function EditVoucherView({ voucher, courses, categories }: Props) {
  const router = useRouter();

  const updateMutation = useUpdateVoucherMutation(voucher.id);
  const statusMutation = useSetVoucherActiveMutation();
  const deleteMutation = useDeleteVoucherMutation();

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSubmit = (values: VoucherFormInput) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Perubahan voucher disimpan.");
        router.push("/admin/vouchers");
      },
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Gagal menyimpan voucher.",
        ),
    });
  };

  const handleToggleActive = () => {
    statusMutation.mutate(
      { id: voucher.id, isActive: !voucher.isActive },
      {
        onSuccess: () => {
          toast.success(
            voucher.isActive
              ? "Voucher dinonaktifkan."
              : "Voucher diaktifkan kembali.",
          );
          setDeactivateOpen(false);
          router.refresh();
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Gagal mengubah status.",
          ),
      },
    );
  };

  const handleDelete = () => {
    setDeleteError(null);
    deleteMutation.mutate(voucher.id, {
      onSuccess: () => {
        toast.success("Voucher dihapus.");
        setDeleteOpen(false);
        router.push("/admin/vouchers");
      },
      onError: (err) =>
        setDeleteError(
          err instanceof Error ? err.message : "Gagal menghapus voucher.",
        ),
    });
  };

  const busy = updateMutation.isPending;

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
        <div className="flex flex-wrap items-center gap-3">
          <PageHeader
            eyebrow="Admin · Manajemen Voucher"
            title="Edit"
            accent="Voucher"
            description="Perbarui detail voucher, nonaktifkan, atau hapus."
          />
          <VoucherStatusBadge status={voucher.status} />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Sudah dipakai{" "}
          <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
            {voucher.usageCount}
          </span>{" "}
          kali.
        </p>
      </div>

      <VoucherForm
        mode="edit"
        initial={toFormInput(voucher)}
        submitting={busy}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin/vouchers")}
        courses={courses}
        categories={categories}
        footerSlot={
          <section className="flex flex-col gap-4 rounded-3xl border border-dashed border-zinc-300 p-5 dark:border-[color:var(--color-surface-border)] sm:p-6">
            <div>
              <h3 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Zona Aksi
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Nonaktifkan untuk menghentikan sementara, atau hapus permanen
                bila belum pernah dipakai.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setDeactivateOpen(true)}
              >
                {voucher.isActive ? (
                  <PowerOff className="size-4" strokeWidth={2.4} />
                ) : (
                  <Power className="size-4" strokeWidth={2.4} />
                )}
                {voucher.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="size-4" strokeWidth={2.4} />
                Hapus Voucher
              </Button>
            </div>
          </section>
        }
      />

      <DeactivateVoucherDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        voucherCode={voucher.code}
        isActive={voucher.isActive}
        pending={statusMutation.isPending}
        onConfirm={handleToggleActive}
      />

      <DeleteVoucherDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeleteError(null);
        }}
        voucherCode={voucher.code}
        deleting={deleteMutation.isPending}
        error={deleteError}
        onConfirm={handleDelete}
      />
    </div>
  );
}
