"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  hint?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
};

export const AuthInput = React.forwardRef<HTMLInputElement, Props>(
  function AuthInput({ label, hint, error, leadingIcon, id, className, ...rest }, ref) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-1.5">
        <Label
          htmlFor={inputId}
          className="text-foreground/80 text-[13px] font-medium tracking-wide"
        >
          {label}
        </Label>
        <div className="relative">
          {leadingIcon ? (
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3.5 flex items-center [&_svg]:size-4">
              {leadingIcon}
            </span>
          ) : null}
          <Input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "h-11 rounded-xl border-[color:var(--color-brand-100)] bg-white text-[15px] shadow-none transition-shadow placeholder:text-slate-400 focus-visible:border-[color:var(--color-brand-400)] focus-visible:ring-[color:var(--color-brand-200)] focus-visible:ring-4",
              leadingIcon && "pl-10",
              error &&
                "border-[color:var(--color-error)] focus-visible:border-[color:var(--color-error)] focus-visible:ring-red-100",
              className,
            )}
            {...rest}
          />
        </div>
        {error ? (
          <p
            id={`${inputId}-error`}
            className="text-[color:var(--color-error)] text-xs"
          >
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-muted-foreground text-xs">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

type PasswordProps = Omit<Props, "type">;

export const AuthPasswordInput = React.forwardRef<HTMLInputElement, PasswordProps>(
  function AuthPasswordInput(props, ref) {
    const [visible, setVisible] = React.useState(false);
    return (
      <div className="relative">
        <AuthInput
          ref={ref}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete ?? "current-password"}
          {...props}
        />
        <button
          type="button"
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          onClick={() => setVisible((v) => !v)}
          className="text-muted-foreground hover:text-foreground absolute right-3 top-[34px] rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-200)]"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);
