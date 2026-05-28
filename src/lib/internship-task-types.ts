/**
 * Client-safe shared types for the Peserta-Magang Tugas surface (list, detail,
 * submit). Both the server loader (`internship-task-loader.ts`) and the client
 * views/helpers import from here — same pattern as `internship-types.ts` for
 * the attendance surface.
 *
 * Mirrors PRD §6.9.3. Stored submission state on `TaskSubmission.status` is
 * `NOT_SUBMITTED | SUBMITTED`; the display layer adds `TERLEWAT` (past
 * deadline + never submitted) for the history tab, and `DIKEMBALIKAN` is the
 * derived label for NOT_SUBMITTED + mentor feedback present.
 */

export type TaskDisplayStatus = "BELUM" | "TERKUMPUL" | "DIKEMBALIKAN" | "TERLEWAT";

/** Stored submission state pre-deadline-derivation (matches what the loader emits). */
export type TaskBaseStatus = "BELUM" | "TERKUMPUL" | "DIKEMBALIKAN";

export type AttachmentKind = "pdf" | "docx" | "zip" | "image";

export type TaskAttachment = {
  name: string;
  /** Pre-formatted human size, e.g. "1,2 MB". */
  sizeLabel: string;
  kind: AttachmentKind;
  /** Signed Bunny URL (or external URL passthrough). May be null if storage
   *  isn't configured yet — UI hides the download in that case. */
  url: string | null;
};

export type MentorFeedback = {
  mentorName: string;
  returnedAtISO: string;
  text: string;
};

export type SubmittedFile = {
  name: string;
  sizeLabel: string;
  submittedAtISO: string;
  /** Signed Bunny URL. Null = pull zone not configured. */
  url: string | null;
};

export type MagangTask = {
  id: string;
  title: string;
  mentorName: string;
  deadlineISO: string;
  description: string;
  requirements?: string[];
  attachment?: TaskAttachment;
  status: TaskBaseStatus;
  feedback?: MentorFeedback;
  submittedFile?: SubmittedFile;
};
