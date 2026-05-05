"use client";

import type { ReportPeriod } from "@/features/report/types";

type ReportPeriodFilterProps = {
  period: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
};

const options: Array<{ label: string; value: ReportPeriod }> = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "All Time", value: "all_time" },
];

export function ReportPeriodFilter({ period, onChange }: ReportPeriodFilterProps) {
  return (
    <div className="warm-panel-compact p-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const active = period === option.value;

          return (
            <button
              className={`chip-base min-h-[44px] rounded-[16px] px-3 text-sm ${
                active
                  ? "chip-active-cream"
                  : ""
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
