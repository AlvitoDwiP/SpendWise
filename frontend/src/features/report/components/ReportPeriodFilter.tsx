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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {options.map((option) => {
          const active = period === option.value;

          return (
            <button
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-purple-500/20 text-purple-200"
                  : "text-white/65 hover:bg-white/10 hover:text-white"
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
