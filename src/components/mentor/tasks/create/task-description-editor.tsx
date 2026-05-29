"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Strikethrough,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

/** Image node extended with a `data-bunny-path` attribute (the stored object
 *  path), so the server can re-sign the URL on every read. */
const BunnyImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      bunnyPath: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-bunny-path"),
        renderHTML: (attrs) =>
          attrs.bunnyPath ? { "data-bunny-path": attrs.bunnyPath } : {},
      },
    };
  },
});

function countImages(editor: Editor): number {
  let n = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === "image") n += 1;
  });
  return n;
}

type Props = {
  /** Emits the editor HTML on every change. */
  onChange: (html: string) => void;
  /** Initial HTML content (edit mode). Images keep their `data-bunny-path`. */
  initialHTML?: string;
  disabled?: boolean;
};

/**
 * Word-like rich-text editor for a task description. Supports basic formatting
 * plus a single pasted/dropped/uploaded image (capped to save Bunny storage).
 * Images upload to `/api/mentor/tasks/images`; the returned object path is kept
 * on the node so it can be normalized/validated server-side.
 */
export function TaskDescriptionEditor({
  onChange,
  initialHTML,
  disabled = false,
}: Props) {
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertImageFile = useCallback(async (file: File) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (countImages(editor) >= 1) {
      toast.error("Maksimal 1 gambar per deskripsi.");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("Format gambar tidak didukung. Gunakan PNG, JPG, WEBP, atau GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Ukuran gambar melebihi batas 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/mentor/tasks/images", { method: "POST", body: fd });
      const json = (await res.json()) as { data?: { path: string; url: string }; error?: string };
      if (!res.ok || !json.data) {
        throw new Error(json.error ?? "Gagal mengunggah gambar.");
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: json.data.url, bunnyPath: json.data.path },
        })
        .run();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    content: initialHTML,
    extensions: [
      StarterKit,
      BunnyImage,
      Placeholder.configure({
        placeholder: "Tulis instruksi tugas di sini… (boleh tempel 1 gambar)",
      }),
    ],
    editorProps: {
      attributes: {
        class: "task-prose min-h-[200px] px-4 py-3 focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const img = Array.from(event.clipboardData?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (!img) return false;
        event.preventDefault();
        void insertImageFile(img);
        return true;
      },
      handleDrop: (_view, event) => {
        const img = Array.from(event.dataTransfer?.files ?? []).find((f) =>
          f.type.startsWith("image/"),
        );
        if (!img) return false;
        event.preventDefault();
        void insertImageFile(img);
        return true;
      },
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editable: !disabled,
  });

  if (!editor) {
    return (
      <div className="grid min-h-[252px] place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]">
        <Loader2 className="size-5 animate-spin text-zinc-400" strokeWidth={2.2} />
      </div>
    );
  }

  const atImageLimit = countImages(editor) >= 1;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 bg-white transition focus-within:border-[color:var(--color-brand-400)] dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-100 bg-zinc-50/70 px-2 py-1.5 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.03]">
        <ToolbarButton label="Tebal" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton label="Miring" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton label="Coret" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Judul" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton label="Subjudul" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton label="Daftar poin" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton label="Daftar nomor" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <ToolbarButton label="Kutipan" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="size-4" strokeWidth={2.4} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          label={atImageLimit ? "Maksimal 1 gambar" : "Sisipkan gambar"}
          active={false}
          disabled={atImageLimit || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
          ) : (
            <ImageIcon className="size-4" strokeWidth={2.4} />
          )}
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void insertImageFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-white/10" aria-hidden />;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-zinc-600 transition disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-300",
        active
          ? "bg-[color:var(--color-brand-500)] text-white dark:text-white"
          : "hover:bg-zinc-200/70 dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}
