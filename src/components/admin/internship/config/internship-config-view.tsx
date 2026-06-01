"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  FolderTree,
  GraduationCap,
  Inbox,
  Layers,
  Loader2,
  Plus,
  type LucideIcon,
} from "lucide-react";

import {
  parseTab,
  type BatchRow,
  type ClassRow,
  type ConfigTab,
  type FieldRow,
} from "@/lib/admin-internship-config-query";
import { cn } from "@/lib/utils";
import { useInternshipConfigQuery } from "@/hooks/use-admin-internship-config";

import { PageHeader } from "@/components/dashboard/shared/page-header";

import { BatchesTable } from "./batches-table";
import { FieldsTable } from "./fields-table";
import { ClassesTable } from "./classes-table";
import { BatchFormDialog } from "./batch-form-dialog";
import { FieldFormDialog } from "./field-form-dialog";
import { ClassCreateDialog, ClassEditDialog } from "./class-form-dialog";

type DialogState =
  | { kind: "batch-create" }
  | { kind: "batch-edit"; row: BatchRow }
  | { kind: "field-create" }
  | { kind: "field-edit"; row: FieldRow }
  | { kind: "class-create" }
  | { kind: "class-edit"; row: ClassRow }
  | null;

const TABS: { value: ConfigTab; label: string; icon: LucideIcon }[] = [
  { value: "batch", label: "Batch", icon: Layers },
  { value: "fields", label: "Bidang", icon: FolderTree },
  { value: "classes", label: "Kelas", icon: GraduationCap },
];

const TAB_META: Record<
  ConfigTab,
  { title: string; subtitle: string; addLabel: string; icon: LucideIcon }
> = {
  batch: {
    title: "Daftar Batch",
    subtitle: "Periode magang beserta tanggal mulai & selesai.",
    addLabel: "Tambah Batch",
    icon: Layers,
  },
  fields: {
    title: "Daftar Bidang",
    subtitle: "Bidang keahlian di tiap batch.",
    addLabel: "Tambah Bidang",
    icon: FolderTree,
  },
  classes: {
    title: "Daftar Kelas",
    subtitle: "Kelas per bidang (maksimal 10 peserta/kelas).",
    addLabel: "Tambah Kelas",
    icon: GraduationCap,
  },
};

export function InternshipConfigView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = parseTab(searchParams.get("tab"));
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogNonce, setDialogNonce] = useState(0);

  const query = useInternshipConfigQuery();
  const data = query.data;

  const setTab = (next: ConfigTab) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "batch") sp.delete("tab");
    else sp.set("tab", next);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const open = (next: NonNullable<DialogState>) => {
    setDialogNonce((n) => n + 1);
    setDialog(next);
  };
  const onAdd = () => {
    if (tab === "batch") open({ kind: "batch-create" });
    else if (tab === "fields") open({ kind: "field-create" });
    else open({ kind: "class-create" });
  };

  const meta = TAB_META[tab];
  const count =
    tab === "batch"
      ? (data?.batches.length ?? 0)
      : tab === "fields"
        ? (data?.fields.length ?? 0)
        : (data?.classes.length ?? 0);
  const canAddField = (data?.batches.length ?? 0) > 0;
  const canAddClass = (data?.fields.length ?? 0) > 0;
  const addDisabled =
    (tab === "fields" && !canAddField) || (tab === "classes" && !canAddClass);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Admin · Program Magang"
        title="Konfigurasi"
        accent="Magang"
        description="Kelola struktur program magang: Batch (periode), Bidang keahlian, dan Kelas. Setiap fitur magang (absensi, tugas, nilai) mengacu pada kelas yang dibuat di sini."
      />

      <TabSwitcher current={tab} onChange={setTab} />

      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[color:var(--color-surface-border)]">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
              <meta.icon className="size-5" strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
                {meta.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {count > 0 ? `${count} item · ${meta.subtitle}` : meta.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {query.isFetching ? (
              <Loader2 className="size-4 animate-spin text-[color:var(--color-brand-500)]" />
            ) : null}
            <button
              type="button"
              onClick={onAdd}
              disabled={addDisabled}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[color:var(--color-brand-600)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" strokeWidth={2.6} />
              {meta.addLabel}
            </button>
          </div>
        </div>

        {query.isPending ? (
          <TableSkeleton />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : count === 0 ? (
          <EmptyState
            tab={tab}
            addDisabled={addDisabled}
            onAdd={onAdd}
          />
        ) : tab === "batch" ? (
          <BatchesTable
            rows={data!.batches}
            isFetching={query.isFetching}
            onEdit={(row) => open({ kind: "batch-edit", row })}
          />
        ) : tab === "fields" ? (
          <FieldsTable
            rows={data!.fields}
            isFetching={query.isFetching}
            onEdit={(row) => open({ kind: "field-edit", row })}
          />
        ) : (
          <ClassesTable
            rows={data!.classes}
            isFetching={query.isFetching}
            onEdit={(row) => open({ kind: "class-edit", row })}
          />
        )}
      </section>

      {/* Dialogs */}
      {dialog?.kind === "batch-create" || dialog?.kind === "batch-edit" ? (
        <BatchFormDialog
          key={dialogNonce}
          open
          onOpenChange={(o) => !o && setDialog(null)}
          mode={dialog.kind === "batch-create" ? "create" : "edit"}
          initial={dialog.kind === "batch-edit" ? dialog.row : undefined}
          onSubmitted={() => query.refetch()}
        />
      ) : null}

      {dialog?.kind === "field-create" || dialog?.kind === "field-edit" ? (
        <FieldFormDialog
          key={dialogNonce}
          open
          onOpenChange={(o) => !o && setDialog(null)}
          mode={dialog.kind === "field-create" ? "create" : "edit"}
          batches={data?.batches ?? []}
          initial={dialog.kind === "field-edit" ? dialog.row : undefined}
          onSubmitted={() => query.refetch()}
        />
      ) : null}

      {dialog?.kind === "class-create" ? (
        <ClassCreateDialog
          key={dialogNonce}
          open
          onOpenChange={(o) => !o && setDialog(null)}
          batches={data?.batches ?? []}
          fields={data?.fields ?? []}
          classes={data?.classes ?? []}
          onSubmitted={() => query.refetch()}
        />
      ) : null}

      {dialog?.kind === "class-edit" ? (
        <ClassEditDialog
          key={dialogNonce}
          open
          onOpenChange={(o) => !o && setDialog(null)}
          initial={dialog.row}
          onSubmitted={() => query.refetch()}
        />
      ) : null}
    </div>
  );
}

type TabSwitcherProps = {
  current: ConfigTab;
  onChange: (next: ConfigTab) => void;
};

function TabSwitcher({ current, onChange }: TabSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Tab konfigurasi magang"
      className={cn(
        "relative inline-grid w-full grid-cols-3 gap-1 rounded-2xl bg-white p-1 ring-1 ring-zinc-200",
        "shadow-[0_24px_40px_-32px_rgba(35,65,137,0.35)]",
        "dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]",
        "sm:max-w-lg",
      )}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = current === t.value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
              active
                ? "bg-[color:var(--color-brand-500)] text-white shadow-[0_10px_22px_-12px_rgba(43,114,234,0.7)]"
                : "text-zinc-500 hover:bg-[color:var(--color-brand-50)] hover:text-[color:var(--color-brand-700)] dark:text-zinc-300/80 dark:hover:bg-white/[0.04] dark:hover:text-[color:var(--color-brand-200)]",
            )}
          >
            <Icon className="size-4" strokeWidth={2.4} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-zinc-50 dark:divide-white/[0.04]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-3.5 w-1/4 rounded bg-zinc-100 dark:bg-white/5" />
          <div className="h-3 flex-1 rounded bg-zinc-100/70 dark:bg-white/[0.03]" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300">
        <Inbox className="size-6" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Gagal memuat konfigurasi magang
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center rounded-full bg-[color:var(--color-brand-500)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--color-brand-600)]"
      >
        Coba lagi
      </button>
    </div>
  );
}

const EMPTY_COPY: Record<ConfigTab, { empty: string; blocked: string }> = {
  batch: {
    empty: "Belum ada batch. Tambahkan periode magang pertama.",
    blocked: "Belum ada batch. Tambahkan periode magang pertama.",
  },
  fields: {
    empty: "Belum ada bidang.",
    blocked: "Buat batch terlebih dahulu sebelum menambah bidang.",
  },
  classes: {
    empty: "Belum ada kelas.",
    blocked: "Buat bidang terlebih dahulu sebelum menambah kelas.",
  },
};

function EmptyState({
  tab,
  addDisabled,
  onAdd,
}: {
  tab: ConfigTab;
  addDisabled: boolean;
  onAdd: () => void;
}) {
  const copy = EMPTY_COPY[tab];
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
        <Inbox className="size-5" />
      </span>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {addDisabled ? copy.blocked : copy.empty}
      </p>
      {!addDisabled ? (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-[12px] font-bold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {TAB_META[tab].addLabel}
        </button>
      ) : null}
    </div>
  );
}
