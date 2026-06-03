"use client";

import { useMemo, useState } from "react";
import {
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

import { cn } from "@/lib/utils";

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["id"], { type: "region" })
    : null;

function countryLabel(code: CountryCode): string {
  const name = regionNames?.of(code) ?? code;
  return `${name} (+${getCountryCallingCode(code)})`;
}

type Props = {
  /** Initial E.164 value to prefill (e.g. "+6281234567890"), or empty. */
  initialValue?: string | null;
  /** Emits an E.164 string, or "" when the national part is blank. */
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
};

/**
 * Optional international phone input: a country calling-code picker + national
 * number, emitting **E.164** to the parent (the format `wa.me`/WhatsApp need).
 * Validation is left to the parent/server (the field is optional).
 */
export function PhoneField({ initialValue, onChange, error, disabled }: Props) {
  const initial = useMemo(() => {
    if (initialValue) {
      const parsed = parsePhoneNumberFromString(initialValue);
      if (parsed?.country) {
        return { country: parsed.country, national: String(parsed.nationalNumber) };
      }
    }
    return { country: "ID" as CountryCode, national: "" };
  }, [initialValue]);

  const [country, setCountry] = useState<CountryCode>(initial.country);
  const [national, setNational] = useState(initial.national);

  const countries = useMemo(
    () =>
      getCountries()
        .map((code) => ({ code, label: countryLabel(code) }))
        .sort((a, b) => a.label.localeCompare(b.label, "id")),
    [],
  );

  function emit(nextCountry: CountryCode, nextNational: string) {
    const digits = nextNational.replace(/\D/g, "");
    onChange(digits ? `+${getCountryCallingCode(nextCountry)}${digits}` : "");
  }

  const fieldBase =
    "h-11 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 outline-none transition focus:border-[color:var(--color-brand-400)] focus:ring-2 focus:ring-[color:var(--color-brand-100)] disabled:cursor-not-allowed disabled:bg-zinc-50";

  return (
    <div>
      <div className="flex gap-2">
        <select
          aria-label="Kode negara"
          value={country}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value as CountryCode;
            setCountry(next);
            emit(next, national);
          }}
          className={cn(fieldBase, "w-[8.5rem] shrink-0 px-2")}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="81234567890"
          value={national}
          disabled={disabled}
          onChange={(e) => {
            setNational(e.target.value);
            emit(country, e.target.value);
          }}
          className={cn(fieldBase, "min-w-0 flex-1 px-3.5")}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-[color:var(--color-error)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
