"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Code,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Terminal,
  Underline as UnderlineIcon,
} from "lucide-react";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  /** Emits the editor HTML on every change. */
  onChange: (html: string) => void;
  /** Initial HTML content (edit mode). */
  initialHTML?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Smaller min-height for compact contexts (e.g. step dialogs). */
  compact?: boolean;
};

/**
 * Text-only rich-text editor (no images) for course / step descriptions
 * (PRD §6.11.3 — "Deskripsi Materi, teks"). Trimmed sibling of the mentor task
 * editor; shares the `.task-prose` typography from globals.css. The HTML is
 * stored verbatim and rendered through `RichTextContent`.
 */
export function RichTextEditor({
  onChange,
  initialHTML,
  placeholder = "Tulis deskripsi di sini…",
  disabled = false,
  compact = false,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    content: initialHTML,
    extensions: [
      StarterKit,
      Underline,
      Superscript,
      Subscript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder })
    ],
    editorProps: {
      attributes: {
        class: cn(
          "task-prose px-4 py-3 focus:outline-none",
          compact ? "min-h-[120px]" : "min-h-[200px]",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editable: !disabled,
  });

  if (!editor) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.02]",
          compact ? "min-h-[172px]" : "min-h-[252px]",
        )}
      >
        <Loader2 className="size-5 animate-spin text-zinc-400" strokeWidth={2.2} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-200 bg-white transition focus-within:border-[color:var(--color-brand-400)] dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)]",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-100 bg-zinc-50/70 px-2 py-1.5 dark:border-[color:var(--color-surface-border)] dark:bg-white/[0.03]">
        <Btn label="Tebal" shortcut="Ctrl + B" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Miring" shortcut="Ctrl + I" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Garis Bawah" shortcut="Ctrl + U" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Coret" shortcut="Ctrl + Shift + X" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Kode Sebaris" shortcut="Ctrl + E" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Sorot" shortcut="Ctrl + Shift + H" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Superskrip" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          <SuperscriptIcon className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Subskrip" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          <SubscriptIcon className="size-4" strokeWidth={2.4} />
        </Btn>
        <Divider />
        <Btn label="Rata Kiri" shortcut="Ctrl + Shift + L" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Rata Tengah" shortcut="Ctrl + Shift + E" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Rata Kanan" shortcut="Ctrl + Shift + R" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Rata Kiri Kanan" shortcut="Ctrl + Shift + J" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify className="size-4" strokeWidth={2.4} />
        </Btn>
        <Divider />
        <Btn label="Judul 2" shortcut="Ctrl + Alt + 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Judul 3" shortcut="Ctrl + Alt + 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="size-4" strokeWidth={2.4} />
        </Btn>
        <Divider />
        <Btn label="Daftar poin" shortcut="Ctrl + Shift + 8" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Daftar nomor" shortcut="Ctrl + Shift + 7" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Kutipan" shortcut="Ctrl + Shift + B" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Blok Kode" shortcut="Ctrl + Alt + C" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Terminal className="size-4" strokeWidth={2.4} />
        </Btn>
        <Btn label="Garis Pemisah" shortcut="Ketik ---" active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="size-4" strokeWidth={2.4} />
        </Btn>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-zinc-200 dark:bg-white/10" aria-hidden />;
}

function Btn({
  label,
  shortcut,
  active,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-zinc-600 transition dark:text-zinc-300",
        active
          ? "bg-[color:var(--color-brand-500)] text-white dark:text-white"
          : "hover:bg-zinc-200/70 dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );

  return (
    <TooltipProvider delay={100}>
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="top" sideOffset={6} className="flex flex-col items-center gap-0.5 px-2 py-1 text-center">
          <span className="font-semibold text-xs">{label}</span>
          {shortcut ? (
            <span className="font-mono text-[10px] opacity-80 tracking-tight">{shortcut}</span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export type { Editor as RichTextEditorInstance };
