"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Building2,
  Clock,
  Compass,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { useUpdatePlatformInfoMutation } from "@/hooks/use-admin-platform-info";
import { cn } from "@/lib/utils";
import {
  PLATFORM_LIST_MAX,
  type PlatformInfo,
  platformInfoSchema,
} from "@/lib/validations/admin-platform-settings";
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
import { Textarea } from "@/components/ui/textarea";

import { StatementSection, TeamSection } from "./platform-info-dynamic";
import { Field, Section } from "./settings-primitives";

type Props = {
  initial: PlatformInfo;
};

export function PlatformInfoForm({ initial }: Props) {
  const router = useRouter();
  const mutation = useUpdatePlatformInfoMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm<PlatformInfo>({
    resolver: zodResolver(platformInfoSchema),
    defaultValues: initial,
  });

  const namaPlatformVal = watch("namaPlatform") || "";
  const taglineVal = watch("tagline") || "";
  const deskripsiVal = watch("deskripsi") || "";
  const emailKontakVal = watch("emailKontak") || "";
  const nomorWhatsappVal = watch("nomorWhatsapp") || "";
  const alamatVal = watch("alamat") || "";
  const kotaVal = watch("kota") || "";
  const negaraVal = watch("negara") || "";

  // Validate first; only open the confirm dialog once the form is clean.
  const onValid = () => setConfirmOpen(true);
  const onInvalid = () => toast.error("Periksa kembali isian informasi platform.");

  const handleConfirm = handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: (saved) => {
        setConfirmOpen(false);
        reset(saved); // re-baseline so isDirty resets to false
        toast.success("Informasi platform berhasil disimpan.");
        router.refresh();
      },
      onError: (err) => {
        setConfirmOpen(false);
        toast.error(err.message || "Gagal menyimpan informasi platform.");
      },
    });
  });

  const saving = mutation.isPending;

  return (
    <>
      <form
        onSubmit={handleSubmit(onValid, onInvalid)}
        className="flex flex-col gap-6"
      >
        {/* Identitas */}
        <Section
          eyebrow="01 · Identitas"
          title="Identitas platform"
          helper="Nama, tagline, dan deskripsi singkat yang merepresentasikan platform."
        >
          <div className="flex flex-col gap-5">
            <Field
              id="namaPlatform"
              label="Nama platform"
              required
              current={namaPlatformVal.length}
              max={100}
              icon={<Building2 className="size-4" strokeWidth={2.4} />}
              error={errors.namaPlatform?.message}
            >
              <Input
                id="namaPlatform"
                placeholder="NextLevel Academy"
                maxLength={100}
                className="h-11"
                {...register("namaPlatform")}
              />
            </Field>

            <Field
              id="tagline"
              label="Tagline"
              current={taglineVal.length}
              max={100}
              icon={<Sparkles className="size-4" strokeWidth={2.4} />}
              error={errors.tagline?.message}
            >
              <Input
                id="tagline"
                placeholder="Naik level skill digitalmu."
                maxLength={100}
                className="h-11"
                {...register("tagline")}
              />
            </Field>

            <Field
              id="deskripsi"
              label="Deskripsi"
              current={deskripsiVal.length}
              max={1500}
              icon={<Sparkles className="size-4" strokeWidth={2.4} />}
              error={errors.deskripsi?.message}
            >
              <Textarea
                id="deskripsi"
                rows={4}
                maxLength={1500}
                placeholder="Platform e-learning dengan gamifikasi dan program magang terintegrasi."
                {...register("deskripsi")}
              />
            </Field>
          </div>
        </Section>

        {/* Kontak */}
        <Section
          eyebrow="02 · Kontak"
          title="Informasi kontak"
          helper="Saluran resmi yang dapat dihubungi pengguna."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="emailKontak"
              label="Email kontak"
              current={emailKontakVal.length}
              max={100}
              icon={<Mail className="size-4" strokeWidth={2.4} />}
              error={errors.emailKontak?.message}
            >
              <Input
                id="emailKontak"
                type="email"
                inputMode="email"
                maxLength={100}
                placeholder="halo@nextlevel.id"
                className="h-11"
                {...register("emailKontak")}
              />
            </Field>

            <Field
              id="nomorWhatsapp"
              label="Nomor WhatsApp"
              current={nomorWhatsappVal.length}
              max={15}
              icon={<Phone className="size-4" strokeWidth={2.4} />}
              error={errors.nomorWhatsapp?.message}
            >
              <Input
                id="nomorWhatsapp"
                inputMode="tel"
                maxLength={15}
                placeholder="+62 812-3456-7890"
                className="h-11"
                {...register("nomorWhatsapp")}
              />
            </Field>
          </div>
        </Section>

        {/* Lokasi & operasional */}
        <Section
          eyebrow="03 · Lokasi & Operasional"
          title="Lokasi & jam operasional"
          helper="Alamat dan waktu layanan operasional platform."
        >
          <div className="flex flex-col gap-5">
            <Field
              id="alamat"
              label="Alamat"
              current={alamatVal.length}
              max={200}
              icon={<MapPin className="size-4" strokeWidth={2.4} />}
              error={errors.alamat?.message}
            >
              <Textarea
                id="alamat"
                rows={2}
                maxLength={200}
                placeholder="Jl. Contoh No. 123, Kecamatan…"
                {...register("alamat")}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="kota"
                label="Kota"
                current={kotaVal.length}
                max={50}
                icon={<MapPin className="size-4" strokeWidth={2.4} />}
                error={errors.kota?.message}
              >
                <Input id="kota" maxLength={50} placeholder="Jakarta" className="h-11" {...register("kota")} />
              </Field>

              <Field
                id="negara"
                label="Negara"
                current={negaraVal.length}
                max={60}
                icon={<Globe2 className="size-4" strokeWidth={2.4} />}
                error={errors.negara?.message}
              >
                <Input
                  id="negara"
                  placeholder="Indonesia"
                  maxLength={60}
                  className="h-11"
                  {...register("negara")}
                />
              </Field>
            </div>

            <Field
              id="jamOperasional"
              label="Jam operasional"
              icon={<Clock className="size-4" strokeWidth={2.4} />}
              error={errors.jamOperasional?.message}
            >
              <Input
                id="jamOperasional"
                placeholder="Senin–Jumat, 09.00–17.00 WIB"
                className="h-11"
                {...register("jamOperasional")}
              />
            </Field>
          </div>
        </Section>

        {/* Visi (dinamis) */}
        <StatementSection
          control={control}
          register={register}
          errors={errors}
          name="visi"
          eyebrow="04 · Visi"
          title="Visi"
          helper="Pernyataan visi platform. Tambahkan satu atau beberapa poin."
          noun="Visi"
          placeholder="Contoh: Menjadi platform belajar digital paling memberdayakan di Indonesia."
          icon={Target}
          max={PLATFORM_LIST_MAX}
        />

        {/* Misi (dinamis) */}
        <StatementSection
          control={control}
          register={register}
          errors={errors}
          name="misi"
          eyebrow="05 · Misi"
          title="Misi"
          helper="Daftar misi yang mendukung visi. Tambah atau kurangi sesuai kebutuhan."
          noun="Misi"
          placeholder="Contoh: Menyediakan kurikulum praktis yang relevan dengan industri."
          icon={Compass}
          max={PLATFORM_LIST_MAX}
        />

        {/* Tim (dinamis) */}
        <TeamSection
          control={control}
          register={register}
          errors={errors}
          eyebrow="06 · Tim"
          title="Tim"
          helper="Anggota tim yang ditampilkan beserta posisinya."
          icon={Users}
          max={PLATFORM_LIST_MAX}
        />

        {/* Action bar */}
        <div
          className={cn(
            "sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-3 ring-1 ring-zinc-200 backdrop-blur",
            "shadow-[0_18px_40px_-28px_rgba(35,65,137,0.45)]",
            "dark:bg-[color:var(--color-surface-card)]/85 dark:ring-[color:var(--color-surface-border)]",
          )}
        >
          <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">
            {isDirty
              ? "Ada perubahan belum disimpan."
              : "Semua perubahan tersimpan."}
          </p>
          <Button
            type="submit"
            disabled={!isDirty || saving}
            className="h-10 rounded-full bg-[color:var(--color-brand-500)] px-5 text-xs font-bold text-white shadow-[0_12px_24px_-12px_rgba(43,114,234,0.7)] hover:bg-[color:var(--color-brand-600)]"
          >
            <Save className="size-3.5" strokeWidth={2.4} />
            Simpan Perubahan
          </Button>
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={(o) => !saving && setConfirmOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <span className="grid size-10 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] ring-1 ring-[color:var(--color-brand-200)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-300)] dark:ring-[color:var(--color-brand-500)]/30">
              <Save className="size-5" strokeWidth={2.2} />
            </span>
            <DialogTitle>Simpan informasi platform?</DialogTitle>
            <DialogDescription>
              Perubahan akan disimpan dan tercatat di log audit. Lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => setConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => handleConfirm()}
              className="bg-[color:var(--color-brand-500)] text-white hover:bg-[color:var(--color-brand-600)]"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
              ) : null}
              {saving ? "Menyimpan…" : "Ya, simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
