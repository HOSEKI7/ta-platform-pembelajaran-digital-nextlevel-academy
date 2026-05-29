import { cn } from "@/lib/utils";

type Props = {
  /** Sanitized/normalized HTML produced by the Tiptap editor (server-signed
   *  image URLs already resolved by the loader). */
  html: string;
  className?: string;
};

/**
 * Read-only renderer for a task's rich-text description. The HTML is constrained
 * to Tiptap's schema and image `src`s are validated to Bunny paths server-side
 * (see `task-description.ts`), so `dangerouslySetInnerHTML` is safe here. Styled
 * by `.task-prose` in globals.css — shared with the mentor editor preview.
 */
export function RichTextContent({ html, className }: Props) {
  return (
    <div
      className={cn("task-prose", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
