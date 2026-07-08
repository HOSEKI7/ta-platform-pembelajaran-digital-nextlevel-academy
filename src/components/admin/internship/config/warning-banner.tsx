"use client";

import { AlertTriangle } from "lucide-react";

interface WarningBannerProps {
  severity: "soft" | "hard";
  children: React.ReactNode;
}

export function WarningBanner({ severity, children }: WarningBannerProps) {
  const colors =
    severity === "hard"
      ? "border-rose-300 bg-rose-50 text-rose-800"
      : "border-amber-300 bg-amber-50 text-amber-800";

  return (
    <div className={`flex items-start gap-2 rounded-md border p-3 text-sm ${colors}`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
