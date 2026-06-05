"use client";

import { AlertTriangle, Loader2, Power, PowerOff, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ConfirmTone = "danger" | "warning" | "success";

const TONE_ICON: Record<ConfirmTone, LucideIcon> = {
  danger: AlertTriangle,
  warning: PowerOff,
  success: Power,
};

const TONE_BADGE: Record<ConfirmTone, string> = {
  danger:
    "bg-red-50 text-red-600 ring-red-200 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30",
  warning:
    "bg-amber-50 text-amber-600 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30",
  success:
    "bg-emerald-50 text-emerald-600 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tone: ConfirmTone;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  loading: boolean;
  onConfirm: () => void;
};

/** Shared confirmation modal for admin-account actions (toggle/delete/revoke). */
export function AdminConfirmDialog({
  open,
  onOpenChange,
  tone,
  title,
  description,
  confirmLabel,
  pendingLabel,
  loading,
  onConfirm,
}: Props) {
  const Icon = TONE_ICON[tone];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span
            className={cn(
              "grid size-10 place-items-center rounded-full ring-1",
              TONE_BADGE[tone],
            )}
          >
            <Icon className="size-5" strokeWidth={2.2} />
          </span>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant={tone === "success" ? "default" : "destructive"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> : null}
            {loading ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
