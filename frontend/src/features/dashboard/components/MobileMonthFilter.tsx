"use client";

import { CalendarDays, ChevronDown } from "lucide-react";

type MobileMonthFilterProps = {
  monthOptions: Array<{
    key: string;
    label: string;
  }>;
  onMonthChange: (value: string) => void;
  selectedMonthKey: string;
};

export function MobileMonthFilter({
  monthOptions,
  onMonthChange,
  selectedMonthKey,
}: MobileMonthFilterProps) {
  return (
    <label className="relative mt-0 inline-flex w-fit max-w-full items-center md:hidden">
      <span className="sr-only">Choose month</span>
      <span className="pointer-events-none absolute left-5 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[var(--text-secondary)]" />
      <CalendarDays className="sr-only" />
      <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
      <select
        className="h-11 w-fit max-w-[11.5rem] appearance-none rounded-full border border-[var(--border-muted)] bg-[#1f1a15] pl-9 pr-11 font-sans text-[15px] font-medium leading-none text-[#c8bba8] outline-none transition focus:border-[var(--text-secondary)]"
        onChange={(event) => onMonthChange(event.target.value)}
        value={selectedMonthKey}
      >
        {monthOptions.map((option) => (
          <option className="bg-[var(--surface-base)] text-[var(--text-primary)]" key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
