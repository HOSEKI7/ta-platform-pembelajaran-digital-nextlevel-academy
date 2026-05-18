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
      <div className="space-y-1.5 min-[1920px]:space-y-2">
        <Label
          htmlFor={inputId}
          className="text-foreground/80 text-[13px] font-medium tracking-wide min-[1920px]:text-sm"
        >
          {label}
        </Label>
        <div className="relative">
          {leadingIcon ? (
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3.5 flex items-center [&_svg]:size-4 min-[1920px]:left-4 min-[1920px]:[&_svg]:size-[18px]">
              {leadingIcon}
            </span>
          ) : null}
          <Input
            id={inputId}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              // Heights scale at 2K so the field stays visually proportional
              // to the wider form container (max-w-md → max-w-[600px]).
              "h-11 rounded-xl border-[color:var(--color-brand-100)] bg-white text-[15px] shadow-none transition-shadow placeholder:text-slate-400 focus-visible:border-[color:var(--color-brand-400)] focus-visible:ring-[color:var(--color-brand-200)] focus-visible:ring-4 min-[1920px]:h-[52px] min-[1920px]:rounded-2xl min-[1920px]:text-base",
              leadingIcon && "pl-10 min-[1920px]:pl-12",
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
            className="text-[color:var(--color-error)] text-xs min-[1920px]:text-[13px]"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${inputId}-hint`}
            className="text-muted-foreground text-xs min-[1920px]:text-[13px]"
          >
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
          className="text-muted-foreground hover:text-foreground absolute right-3 top-[34px] rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-brand-200)] min-[1920px]:right-4 min-[1920px]:top-[42px]"
        >
          {visible ? (
            <EyeOff className="size-4 min-[1920px]:size-[18px]" />
          ) : (
            <Eye className="size-4 min-[1920px]:size-[18px]" />
          )}
        </button>
      </div>
    );
  },
);
