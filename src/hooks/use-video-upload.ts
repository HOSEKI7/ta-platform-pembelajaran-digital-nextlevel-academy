"use client";

import { useCallback, useRef, useState } from "react";
import * as tus from "tus-js-client";

/**
 * Direct browser → Bunny Stream video upload (PRD §6.11.3). Two steps:
 *   1. Ask our server for a signed TUS authorization (creates the Bunny video
 *      object + signature) — `POST /api/admin/videos/create-upload`.
 *   2. Upload the file straight to Bunny via the TUS protocol with those headers
 *      (resumable, supports up to 500 MB). The bytes never touch our server.
 * On success the caller receives the `videoGuid` to persist with the step.
 */

export type VideoUploadState =
  | { phase: "idle" }
  | { phase: "preparing" }
  | { phase: "uploading"; progress: number }
  | { phase: "done"; videoGuid: string }
  | { phase: "error"; message: string };

type UploadAuth = {
  videoGuid: string;
  libraryId: string;
  signature: string;
  expires: number;
  endpoint: string;
};

const MAX_BYTES = 500 * 1024 * 1024; // 500 MB (PRD §6.11.3)
const ACCEPT_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function useVideoUpload() {
  const [state, setState] = useState<VideoUploadState>({ phase: "idle" });
  const uploadRef = useRef<tus.Upload | null>(null);

  const reset = useCallback(() => {
    uploadRef.current?.abort().catch(() => {});
    uploadRef.current = null;
    setState({ phase: "idle" });
  }, []);

  const start = useCallback(async (file: File, title: string) => {
    if (file.size > MAX_BYTES) {
      setState({ phase: "error", message: "Ukuran video melebihi batas 500 MB." });
      return;
    }
    if (file.type && !ACCEPT_TYPES.includes(file.type)) {
      setState({ phase: "error", message: "Format video harus MP4 atau WebM." });
      return;
    }

    setState({ phase: "preparing" });

    let auth: UploadAuth;
    try {
      const res = await fetch("/api/admin/videos/create-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || file.name }),
      });
      const body = (await res.json().catch(() => null)) as
        | { data?: UploadAuth; error?: string }
        | null;
      if (!res.ok || !body?.data) {
        throw new Error(body?.error ?? "Gagal menyiapkan unggahan.");
      }
      auth = body.data;
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Gagal menyiapkan unggahan.",
      });
      return;
    }

    const upload = new tus.Upload(file, {
      endpoint: auth.endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: auth.signature,
        AuthorizationExpire: String(auth.expires),
        VideoId: auth.videoGuid,
        LibraryId: auth.libraryId,
      },
      metadata: { filetype: file.type || "video/mp4", title: title || file.name },
      onError: (error) => {
        setState({ phase: "error", message: error.message || "Unggahan gagal." });
      },
      onProgress: (sent, total) => {
        setState({ phase: "uploading", progress: total > 0 ? sent / total : 0 });
      },
      onSuccess: () => {
        setState({ phase: "done", videoGuid: auth.videoGuid });
      },
    });

    uploadRef.current = upload;
    upload.start();
  }, []);

  return { state, start, reset } as const;
}
