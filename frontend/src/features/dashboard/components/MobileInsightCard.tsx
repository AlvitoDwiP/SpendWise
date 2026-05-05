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
        <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,34,38,0.98),rgba(24,24,27,0.95))] px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
          <button
            className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300"
            onClick={() => setIsVisible(true)}
            type="button"
          >
            View Summary
            <ChevronRight className="h-4 w-4" />
          </button>

          <label className="relative min-w-0">
            <span className="sr-only">Choose dashboard period</span>
            <select
              className="h-10 appearance-none rounded-full border border-white/10 bg-white/[0.05] px-4 pr-8 text-sm font-medium text-white/78 outline-none"
              onChange={(event) => onMonthChange(event.target.value)}
              value={selectedMonthKey}
            >
              {monthOptions.map((option) => (
                <option className="bg-[#1c1c1e] text-white" key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              {monthLabel.slice(0, 3)}
            </span>
          </label>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 md:hidden">
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(34,34,38,0.98),rgba(24,24,27,0.95))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
              <BellRing className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Monthly Insight</p>
              <p className="mt-1 text-sm leading-6 text-white/62">
                {summary}
              </p>
            </div>
          </div>

          <button
            aria-label="Close insight card"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/8 bg-white/[0.04] text-white/40 transition hover:text-white/70"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 border-t border-white/8 pt-3.5">
          <div className="flex items-center justify-between gap-3">
            <button
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300"
              onClick={() => setIsVisible(false)}
              type="button"
            >
              Manage Dashboard
              <ChevronRight className="h-4 w-4" />
            </button>

            <label className="relative min-w-0">
              <span className="sr-only">Choose dashboard period</span>
              <select
                className="h-10 appearance-none rounded-full border border-white/10 bg-white/[0.05] px-4 pr-8 text-sm font-medium text-white/78 outline-none"
                onChange={(event) => onMonthChange(event.target.value)}
                value={selectedMonthKey}
              >
                {monthOptions.map((option) => (
                  <option className="bg-[#1c1c1e] text-white" key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                {monthLabel.slice(0, 3)}
              </span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
