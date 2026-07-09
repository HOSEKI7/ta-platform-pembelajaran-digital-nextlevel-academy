"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatInTimeZone } from "date-fns-tz";
import { id as idLocale } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Download,
  FileArchive,
  FileImage,
  FileText,
  Info,
  ListChecks,
  Loader2,
  Lock,
  Paperclip,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentPageContainer } from "@/components/dashboard/shared/student-page-container";
import { useTaskSubmitMutation } from "@/hooks/use-internship-task-submit";

import { MentorFeedbackCard } from "./mentor-feedback-card";
import { RichTextContent } from "./rich-text-content";
import { SubmissionCelebration } from "./submission-celebration";
import { SubmissionDropzone } from "./submission-dropzone";
import { TaskStatusBadge } from "./task-status-badge";
import {
  resolveStatus,
  type AttachmentKind,
  type MagangTask,
  type TaskDisplayStatus,
} from "./task-helpers";

const WIB_TZ = "Asia/Jakarta";

type Props = {
  task: MagangTask;
  /** Server-captured "now" so the countdown's first render matches SSR. */
  serverNowISO: string;
};

const ATTACHMENT_ICON: Record<AttachmentKind, typeof FileText> = {
  pdf: FileText,
  docx: FileText,
  zip: FileArchive,
  image: FileImage,
};

function formatCountdown(deadline: Date, now: Date): { label: string; overdue: boolean } {
  const ms = deadline.getTime() - now.getTime();
  if (ms <= 0) return { label: "Tenggat telah berakhir", overdue: true };
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return { label: `${days} hari ${hours} jam lagi`, overdue: false };
  if (hours > 0) return { label: `${hours} jam ${minutes} menit lagi`, overdue: false };
  return { label: `${minutes} menit lagi`, overdue: false };
}

/**
 * Client composer for `/internship/tasks/[taskId]`. UI-only: the "Kumpulkan
 * Tugas" flow is a local-state demo (no upload) that flips the task to
 * Terkumpul — mirroring how the Absensi check-in began before DB wiring.
 *
 * Layout: the dropzone and the primary submit CTA live together in the
 * "Pengumpulan Tugas" card; submitting opens a confirmation dialog first.
 * Mentor return-feedback is demoted to the sidebar under "Ringkasan".
 */
export function TaskDetailView({ task, serverNowISO }: Props) {
  const [now, setNow] = useState<Date>(() => new Date(serverNowISO));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reuploadMode, setReuploadMode] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [flash, setFlash] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submissionRef = useRef<HTMLElement | null>(null);
  const submitMutation = useTaskSubmitMutation(task.id);
  const isSubmitting = submitMutation.isPending;
  // submittedFile is server-truth: after a successful submit the hook calls
  // router.refresh() and the parent re-renders this view with updated `task`.
  const submittedFile = task.submittedFile ?? null;

  // Derived values (order matters — overdue/submitted needed by the interval effect).
  const deadline = useMemo(() => new Date(task.deadlineISO), [task.deadlineISO]);
  const countdown = formatCountdown(deadline, now);
  const overdue = countdown.overdue;
  const submitted = submittedFile !== null;

  // Live-tick the countdown once per minute (post-hydration only).
  // ponytail: stop ticking once status is terminal (submitted or overdue).
  useEffect(() => {
    if (submitted || overdue) return;
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, [submitted, overdue]);

  // Transient celebration overlay — unmount shortly after it plays.
  useEffect(() => {
    if (!celebrating) return;
    const t = window.setTimeout(() => setCelebrating(false), 1600);
    return () => window.clearTimeout(t);
  }, [celebrating]);

  // Transient dropzone "flash" when the CTA scrolls to it.
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(false), 1200);
    return () => window.clearTimeout(t);
  }, [flash]);

  // Effective status: a local submission always wins; otherwise derive from data.
  const status: TaskDisplayStatus = submitted ? "TERKUMPUL" : resolveStatus(task, now);

  const deadlineLong = formatInTimeZone(deadline, WIB_TZ, "EEEE, dd MMMM yyyy · HH:mm", {
    locale: idLocale,
  });
  const deadlineShort = formatInTimeZone(deadline, WIB_TZ, "dd/MM/yyyy · HH:mm");
  const submittedTimeShort = submittedFile
    ? formatInTimeZone(new Date(submittedFile.submittedAtISO), WIB_TZ, "dd/MM · HH:mm")
    : null;

  const showForm = (!submitted && !overdue) || reuploadMode;
  const armed = Boolean(selectedFile) && !isSubmitting;

  function scrollToDropzone() {
    submissionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(true);
  }

  function handleSubmit() {
    if (!selectedFile) return;
    submitMutation.mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        setReuploadMode(false);
        setCelebrating(true);
        toast.success("Tugas berhasil dikumpulkan.", {
          description: "Mentor akan meninjau hasil pekerjaanmu.",
        });
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Gagal mengumpulkan tugas.",
        );
      },
    });
  }

  // Submit now lives in the "Pengumpulan Tugas" card next to the dropzone, so
  // the CTA no longer needs to scroll — it just guards on a picked file and
  // opens the confirmation dialog. `scrollToDropzone` is still used by the
  // "Kumpulkan ulang" affordance in the submitted-state hero card.
  function requestSubmit() {
    if (!selectedFile || isSubmitting) return;
    setConfirmOpen(true);
  }

  function confirmSubmit() {
    setConfirmOpen(false);
    handleSubmit();
  }

  const AttachmentIcon = task.attachment ? ATTACHMENT_ICON[task.attachment.kind] : null;

  return (
    <StudentPageContainer>
      <SubmissionCelebration show={celebrating} />

      {/* Back link */}
      <Link
        href="/internship/tasks"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-zinc-500 transition hover:text-[color:var(--color-brand-700)] dark:text-zinc-400 dark:hover:text-[color:var(--color-brand-300)]"
      >
        <ArrowLeft className="size-4" strokeWidth={2.4} />
        Kembali ke Daftar Tugas
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 100% 0%, rgba(71,142,244,0.10) 0%, transparent 42%)",
              }}
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              {/* Left: identity */}
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand-700)] dark:text-[color:var(--color-brand-300)]">
                    Magang · Detail Tugas
                  </span>
                  <TaskStatusBadge status={status} size="md" />
                </div>

                <h1 className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                  {task.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-4 text-zinc-400" strokeWidth={2} />
                    Oleh <span className="font-semibold text-zinc-800 dark:text-zinc-100">{task.mentorName}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-4 text-zinc-400" strokeWidth={2} />
                    Tenggat <span className="font-semibold text-zinc-800 dark:text-zinc-100">{deadlineLong} WIB</span>
                  </span>
                </div>

                {/* Countdown banner */}
                <div
                  className={cn(
                    "inline-flex w-fit items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold ring-1",
                    overdue
                      ? "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15"
                      : "bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-700)] ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30",
                  )}
                >
                  <Clock className="size-4" strokeWidth={2.4} />
                  {countdown.label}
                </div>
              </div>

              {/* Right: action zone (top-right). The submit CTA lives in the
                  "Pengumpulan Tugas" card below (next to the dropzone); the hero
                  only surfaces the terminal submitted/overdue states. */}
              <div className="w-full shrink-0 lg:w-auto">
                {showForm ? null : submitted ? (
                  <div className="flex w-full flex-col gap-1.5 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30 lg:w-[256px]">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="size-5 shrink-0" strokeWidth={2.3} />
                      Tugas Terkumpul
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700/85 dark:text-emerald-300/80">
                      <Clock className="size-3.5 shrink-0" strokeWidth={2.2} />
                      Dikumpulkan {submittedTimeShort} WIB
                    </span>
                    {!overdue ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReuploadMode(true);
                          scrollToDropzone();
                        }}
                        className="mt-1 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[color:var(--color-brand-700)] transition hover:gap-2 dark:text-[color:var(--color-brand-300)]"
                      >
                        <RefreshCw className="size-3.5" strokeWidth={2.3} />
                        Kumpulkan ulang
                      </button>
                    ) : null}
                  </div>
                ) : overdue ? (
                  <div className="inline-flex w-full items-center gap-2 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-300 dark:ring-white/15 lg:w-auto">
                    <Lock className="size-4 shrink-0" strokeWidth={2.3} />
                    Pengumpulan ditutup
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Instructions */}
          <section className="rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-7 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
            <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Instruksi Tugas
            </h2>
            <RichTextContent
              html={task.description}
              className="mt-3 text-zinc-600 dark:text-zinc-300"
            />

            {task.requirements && task.requirements.length > 0 ? (
              <div className="mt-5 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100 dark:bg-white/[0.03] dark:ring-[color:var(--color-surface-border)]">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  <ListChecks className="size-4" strokeWidth={2.2} />
                  Kriteria Pengumpulan
                </p>
                <ul className="mt-3 flex flex-col gap-2">
                  {task.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-[color:var(--color-brand-500)]"
                        strokeWidth={2.2}
                      />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Mentor attachment (optional) */}
            {task.attachment && AttachmentIcon ? (
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Lampiran dari Mentor
                </p>
                {task.attachment.url ? (
                  <a
                    href={task.attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-2 flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 text-left transition hover:border-[color:var(--color-brand-200)] hover:bg-[color:var(--color-brand-50)]/40 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02] dark:hover:border-[color:var(--color-brand-400)]/40 dark:hover:bg-white/[0.04]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                      <AttachmentIcon className="size-5" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {task.attachment.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {task.attachment.sizeLabel}
                      </p>
                    </div>
                    <Download
                      className="size-4 shrink-0 text-zinc-400 transition group-hover:text-[color:var(--color-brand-600)]"
                      strokeWidth={2.2}
                    />
                  </a>
                ) : (
                  <div className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 opacity-70 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                      <AttachmentIcon className="size-5" strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {task.attachment.name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Tautan unduh belum tersedia
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          {/* Submission */}
          <section
            ref={submissionRef}
            className={cn(
              "rounded-3xl bg-white p-6 ring-1 transition-all sm:p-7 dark:bg-[color:var(--color-surface-card)]",
              flash
                ? "ring-2 ring-[color:var(--color-brand-400)] dark:ring-[color:var(--color-brand-400)]/70"
                : "ring-zinc-200 dark:ring-[color:var(--color-surface-border)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Pengumpulan Tugas
              </h2>
              {submitted && !reuploadMode ? <TaskStatusBadge status="TERKUMPUL" /> : null}
            </div>

            {/* State: submitted (and not re-uploading) */}
            {submitted && !reuploadMode && submittedFile ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-600 ring-1 ring-emerald-200 dark:bg-white/10 dark:text-emerald-400 dark:ring-emerald-500/30">
                  <FileText className="size-5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  {submittedFile.url ? (
                    <a
                      href={submittedFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block truncate text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                    >
                      {submittedFile.name}
                      <Download
                        className="ml-1.5 inline size-3.5 -translate-y-0.5 text-zinc-400 transition group-hover:text-[color:var(--color-brand-600)]"
                        strokeWidth={2.4}
                      />
                    </a>
                  ) : (
                    <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {submittedFile.name}
                    </p>
                  )}
                  <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
                    {submittedFile.sizeLabel} · dikumpulkan{" "}
                    {formatInTimeZone(
                      new Date(submittedFile.submittedAtISO),
                      WIB_TZ,
                      "dd/MM/yyyy · HH:mm",
                    )}{" "}
                    WIB
                  </p>
                </div>
                <CheckCircle2 className="size-6 shrink-0 text-emerald-500" strokeWidth={2.2} />
              </div>
            ) : overdue && !submitted ? (
              /* State: locked (deadline passed, never submitted) */
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-200 dark:bg-white/[0.03] dark:ring-[color:var(--color-surface-border)]">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                  <Lock className="size-5" strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    Pengumpulan ditutup
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Tenggat tugas ini telah berakhir dan tidak dapat dikumpulkan lagi.
                  </p>
                </div>
              </div>
            ) : showForm ? (
              /* State: open form (or revision) — dropzone + submit CTA together */
              <div className="mt-4 flex flex-col gap-3">
                <SubmissionDropzone
                  file={selectedFile}
                  onFileChange={setSelectedFile}
                  disabled={isSubmitting}
                />
                <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Info className="size-3.5 shrink-0" strokeWidth={2.2} />
                  Pastikan file sudah benar sebelum mengumpulkan.
                </p>

                <button
                  type="button"
                  onClick={requestSubmit}
                  disabled={!selectedFile || isSubmitting}
                  className={cn(
                    "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition",
                    "bg-[color:var(--color-brand-accent)] text-[color:var(--color-brand-950)]",
                    "shadow-[0_14px_30px_-12px_rgba(244,214,0,0.8)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(244,214,0,0.9)] active:translate-y-0",
                    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
                    armed && "task-cta-pulse",
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="size-5 animate-spin" strokeWidth={2.3} />
                  ) : (
                    <Send className="size-4 transition group-hover:translate-x-0.5" strokeWidth={2.3} />
                  )}
                  {isSubmitting
                    ? "Mengumpulkan…"
                    : reuploadMode
                      ? "Kumpulkan Revisi"
                      : "Kumpulkan Tugas"}
                </button>

                {reuploadMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setReuploadMode(false);
                      setSelectedFile(null);
                    }}
                    disabled={isSubmitting}
                    className="text-center text-xs font-semibold text-zinc-500 underline-offset-2 transition hover:text-zinc-800 hover:underline disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Batalkan revisi
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex min-w-0 flex-col gap-6 lg:col-span-1">
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-[color:var(--color-surface-card)] dark:ring-[color:var(--color-surface-border)]">
            <h2 className="font-heading text-base font-bold text-zinc-900 dark:text-zinc-100">
              Ringkasan
            </h2>

            <dl className="flex flex-col gap-3.5 text-sm">
              <InfoRow label="Status">
                <TaskStatusBadge status={status} />
              </InfoRow>
              <InfoRow label="Tenggat">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{deadlineShort} WIB</span>
              </InfoRow>
              <InfoRow label="Sisa waktu">
                <span
                  className={cn(
                    "font-semibold",
                    overdue ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-100",
                  )}
                >
                  {countdown.label}
                </span>
              </InfoRow>
              <InfoRow label="Mentor">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{task.mentorName}</span>
              </InfoRow>
            </dl>

            <div className="rounded-2xl bg-[color:var(--color-brand-50)]/70 p-4 ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/10 dark:ring-[color:var(--color-brand-500)]/30">
              <p className="flex items-center gap-1.5 text-xs font-bold text-[color:var(--color-brand-800)] dark:text-[color:var(--color-brand-200)]">
                <Info className="size-4" strokeWidth={2.3} />
                Ketentuan Berkas
              </p>
              <ul className="mt-2 flex flex-col gap-1 text-xs text-[color:var(--color-brand-800)]/80 dark:text-[color:var(--color-brand-200)]/80">
                <li>Format: PDF, DOCX, atau ZIP</li>
                <li>Ukuran maksimal: 5 MB</li>
                <li>Satu berkas per pengumpulan</li>
              </ul>
            </div>
          </div>

          {/* Mentor return feedback (optional) — secondary placement, below summary */}
          {task.feedback ? <MentorFeedbackCard feedback={task.feedback} /> : null}
        </aside>
      </div>

      {/* Submit confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reuploadMode ? "Kumpulkan revisi tugas?" : "Kumpulkan tugas?"}
            </DialogTitle>
            <DialogDescription>
              {reuploadMode
                ? "Berkas baru akan menggantikan pengumpulan sebelumnya. "
                : "Pastikan berkas sudah benar — mentor akan meninjau hasil pekerjaanmu. "}
              {selectedFile ? (
                <span className="mt-2 flex items-center gap-1.5 font-medium text-foreground">
                  <Paperclip
                    className="size-3.5 shrink-0 text-[color:var(--color-brand-600)]"
                    strokeWidth={2.2}
                  />
                  <span className="truncate">{selectedFile.name}</span>
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={confirmSubmit}
              disabled={!selectedFile || isSubmitting}
              className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
            >
              <Send className="size-4" strokeWidth={2.4} />
              Ya, Kumpulkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentPageContainer>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3.5 last:border-0 last:pb-0 dark:border-[color:var(--color-surface-border)]">
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
