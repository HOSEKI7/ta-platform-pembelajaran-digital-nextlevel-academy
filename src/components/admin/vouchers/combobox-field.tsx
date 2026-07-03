"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

type Item = { value: string; label: string };

type Props = {
  label: string;
  items: Item[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  disabled?: boolean;
  searchPlaceholder?: string;
  renderItem?: (item: Item) => React.ReactNode;
};

export function ComboboxField({
  label,
  items,
  value,
  onValueChange,
  placeholder,
  disabled,
  searchPlaceholder,
  renderItem,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "inline-flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 text-sm font-normal text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[color:var(--color-surface-border)] dark:bg-[color:var(--color-surface-card)] dark:text-zinc-100 dark:hover:bg-white/5",
          !selected && "text-zinc-400 dark:text-zinc-500",
        )}
      >
        {selected ? selected.label : placeholder}
        <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start" sideOffset={4}>
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? `Cari ${label.toLowerCase()}…`} />
          <CommandEmpty>Tidak ditemukan.</CommandEmpty>
          <CommandList>
            <CommandItem
              value="__all__"
              onSelect={() => {
                onValueChange(null);
                setOpen(false);
              }}
            >
              <Check className={cn("mr-2 size-4", value === null ? "opacity-100" : "opacity-0")} />
              {placeholder}
            </CommandItem>
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => {
                  onValueChange(item.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("mr-2 size-4 shrink-0", value === item.value ? "opacity-100" : "opacity-0")}
                />
                {renderItem ? renderItem(item) : item.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
