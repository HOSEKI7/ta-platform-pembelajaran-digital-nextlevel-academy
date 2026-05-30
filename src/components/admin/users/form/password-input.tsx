"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Props = Omit<React.ComponentProps<"input">, "type">;

/**
 * Password input with a show/hide toggle. Forwards all props (including the
 * react-hook-form `register(...)` spread) straight to the underlying Input.
 */
export function PasswordInput({ className, ...props }: Props) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        className={cn("h-11 rounded-xl pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
        tabIndex={-1}
      >
        {show ? (
          <EyeOff className="size-4" strokeWidth={2.2} />
        ) : (
          <Eye className="size-4" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}
