"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PRIVACY_SECTIONS } from "@/lib/legal/privacy-content";

type Props = {
  children: ReactNode;
  onAgree: () => void;
};

export function PrivacyPolicyDialog({ children, onAgree }: Props) {
  const [open, setOpen] = useState(false);

  const effectiveDate = new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function handleAgree() {
    onAgree();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle className="text-xl">Kebijakan Privasi</DialogTitle>
          <DialogDescription>
            Berlaku efektif sejak {effectiveDate}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 overflow-y-auto px-6 py-5 text-sm leading-relaxed">
          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="mb-1.5 font-semibold">{section.title}</h3>
              <p dangerouslySetInnerHTML={{ __html: section.body }} />
            </section>
          ))}
        </div>

        <DialogFooter className="m-0 rounded-b-xl border-t bg-muted/50 px-6 py-4">
          <Button
            type="button"
            onClick={handleAgree}
            className="bg-[color:var(--color-brand-600)] hover:bg-[color:var(--color-brand-700)] h-11 w-full rounded-xl sm:w-auto"
          >
            Saya Setuju dengan Kebijakan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
