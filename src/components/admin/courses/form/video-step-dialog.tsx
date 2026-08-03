"use client";

import { useMemo, useState } from "react";
import { Loader2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVideoUpload } from "@/hooks/use-video-upload";
import type { StepVideoPayload } from "@/hooks/use-admin-curriculum";

import dynamic from "next/dynamic";

import { Field } from "./field";
import { VideoUploader } from "./video-uploader";

const RichTextEditor = dynamic(
  () => import("./rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false },
);

export type VideoStepInitial = {
  title: string;
  description: string;
  bunnyVideoId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initial?: VideoStepInitial;
  saving: boolean;
  sprintId: string;
  onSave: (payload: Omit<StepVideoPayload, "type">) => void;
};

export function VideoStepDialog({ open, onOpenChange, mode, initial, saving, sprintId, onSave }: Props) {
  // State seeds from `initial` on mount. The parent remounts this dialog (via a
  // changing `key`) each time it opens, so there's no effect-based re-seed.
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const upload = useVideoUpload();

  const uploadedGuid = upload.state.phase === "done" ? upload.state.videoGuid : "";
  const effectiveGuid = uploadedGuid || initial?.bunnyVideoId || "";
  const uploadBusy = upload.state.phase === "preparing" || upload.state.phase === "uploading";
  const canSave = useMemo(
    () => title.trim().length >= 2 && Boolean(effectiveGuid) && !uploadBusy && !saving,
    [title, effectiveGuid, uploadBusy, saving],
  );

  return (
    <Dialog open={open} onOpenChange={(o) => (uploadBusy ? null : onOpenChange(o))}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-[color:var(--color-brand-50)] text-[color:var(--color-brand-600)] ring-1 ring-[color:var(--color-brand-100)] dark:bg-[color:var(--color-brand-500)]/15 dark:text-[color:var(--color-brand-200)] dark:ring-[color:var(--color-brand-500)]/30">
            <Video className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>{mode === "create" ? "Tambah Tahap Video" : "Edit Tahap Video"}</DialogTitle>
          <DialogDescription>
            Unggah video pembelajaran. File diunggah langsung ke Bunny dan diproses di latar belakang.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-1">
          <Field label="Judul Video" htmlFor="video-title" current={title.length} max={100}>
            <Input
              id="video-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Pengantar React Hooks"
              maxLength={100}
              className="h-11 rounded-xl"
              disabled={saving}
            />
          </Field>

          <Field label="File Video">
            <VideoUploader
              state={upload.state}
              existingLabel={mode === "edit" && initial?.bunnyVideoId ? "tersimpan" : undefined}
              onPick={(file) => upload.start(sprintId, file, title || file.name)}
              onReset={upload.reset}
              disabled={saving}
            />
          </Field>

          <Field
            label="Deskripsi Materi"
            optional
            hint="Catatan/ringkasan materi yang tampil di tab Deskripsi (maks. 3000 karakter)."
          >
            <RichTextEditor
              compact
              initialHTML={initial?.description}
              disabled={saving}
              placeholder="Ringkasan isi video…"
              onChange={setDescription}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={saving || uploadBusy}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={!canSave}
            onClick={() => onSave({ title: title.trim(), description, bunnyVideoId: effectiveGuid })}
            className="bg-[color:var(--color-brand-600)] text-white hover:bg-[color:var(--color-brand-700)]"
          >
            {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> : null}
            {saving ? "Menyimpan…" : "Simpan Tahap"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
