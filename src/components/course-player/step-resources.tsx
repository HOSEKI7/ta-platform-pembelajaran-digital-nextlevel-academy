"use client";

import { Code2, FileText, Link2, type LucideIcon } from "lucide-react";

import type { PlayerResource } from "@/lib/course-player/types";

type Props = {
  resources: PlayerResource[] | undefined;
};

const KIND_META: Record<
  PlayerResource["kind"],
  { Icon: LucideIcon; label: string; color: string }
> = {
  pdf: { Icon: FileText, label: "PDF", color: "#ef4444" },
  link: { Icon: Link2, label: "Tautan", color: "#478ef4" },
  code: { Icon: Code2, label: "Kode", color: "#22c55e" },
};

export function StepResources({ resources }: Props) {
  if (!resources || resources.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[color:var(--player-hairline-strong)] bg-[color:var(--player-surface-strong)] px-4 py-10 text-center">
        <p className="text-sm font-medium text-zinc-500">
          Belum ada sumber pendukung untuk materi ini.
        </p>
        <p className="mt-1 text-[12px] text-zinc-400">
          Mentor bisa menambahkan PDF, tautan, atau snippet kode dari panel admin.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {resources.map((r) => {
        const meta = KIND_META[r.kind];
        const Icon = meta.Icon;
        return (
          <li key={r.label}>
            <a
              href={r.href}
              target={r.kind === "link" ? "_blank" : undefined}
              rel={r.kind === "link" ? "noopener noreferrer" : undefined}
              className="group/resource flex items-center gap-3 rounded-xl border border-[color:var(--player-hairline)] bg-[color:var(--player-surface-strong)] p-3 transition hover:border-[color:var(--player-accent)]/40 hover:bg-[color:var(--player-glow-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--player-accent)]/50"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl ring-1"
                style={{
                  backgroundColor: `${meta.color}1a`,
                  color: meta.color,
                  borderColor: `${meta.color}40`,
                }}
              >
                <Icon className="size-4" strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{r.label}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {meta.label}
                  {r.meta ? ` · ${r.meta}` : ""}
                </p>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
