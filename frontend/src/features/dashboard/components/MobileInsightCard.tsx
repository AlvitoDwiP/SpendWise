"use client";

import { useState } from "react";
import { BellRing, ChevronRight, X } from "lucide-react";

type MobileInsightCardProps = {
  monthLabel: string;
  onMonthChange: (value: string) => void;
  selectedMonthKey: string;
  summary: string;
  monthOptions: Array<{
    key: string;
    label: string;
  }>;
};

export function MobileInsightCard({
  monthLabel,
  monthOptions,
  onMonthChange,
  selectedMonthKey,
  summary,
}: MobileInsightCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <section className="px-5 md:hidden">
        <div className="warm-panel-compact flex items-center justify-between gap-3 px-4 py-3">
          <button
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-cream)]"
            onClick={() => setIsVisible(true)}
            type="button"
          >
            View Summary
            <ChevronRight className="h-4 w-4" />
          </button>

          <label className="relative min-w-0">
            <span className="sr-only">Choose dashboard period</span>
            <select
              className="chip-base h-10 appearance-none pr-8 text-sm"
              onChange={(event) => onMonthChange(event.target.value)}
              value={selectedMonthKey}
            >
              {monthOptions.map((option) => (
                <option className="bg-[#211d18] text-white" key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {monthLabel.slice(0, 3)}
            </span>
          </label>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 md:hidden">
      <div className="warm-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(237,226,200,0.2)] bg-[rgba(237,226,200,0.08)] text-[var(--accent-cream)]">
              <BellRing className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Monthly Insight</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                {summary}
              </p>
            </div>
          </div>

          <button
            aria-label="Close insight card"
            className="icon-button h-8 w-8 shrink-0 rounded-full text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 border-t border-[var(--border-muted)] pt-3.5">
          <div className="flex items-center justify-between gap-3">
            <button
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-cream)]"
              onClick={() => setIsVisible(false)}
              type="button"
            >
              Manage Dashboard
              <ChevronRight className="h-4 w-4" />
            </button>

            <label className="relative min-w-0">
              <span className="sr-only">Choose dashboard period</span>
              <select
                className="chip-base h-10 appearance-none pr-8 text-sm"
                onChange={(event) => onMonthChange(event.target.value)}
                value={selectedMonthKey}
              >
                {monthOptions.map((option) => (
                  <option className="bg-[#211d18] text-white" key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {monthLabel.slice(0, 3)}
              </span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
