"use client";

import { formatRupiah } from "@/lib/format";

type MobileFinancialSummaryCompactCardProps = {
  expense: number;
  income: number;
};

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function MobileFinancialSummaryCompactCard({
  expense,
  income,
}: MobileFinancialSummaryCompactCardProps) {
  const baseline = income > 0 ? income : Math.max(expense, 1);
  const progress = Math.min(expense / Math.max(baseline, 1), 1);
  const strokeOffset = RING_CIRCUMFERENCE * (1 - progress);
  const progressPercent = Math.round(progress * 100);

  return (
    <article className="flex min-h-[156px] flex-col rounded-[24px] border border-[var(--border-muted)] bg-[var(--surface-base)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <p className="font-sans text-[13px] font-medium uppercase leading-5 tracking-[0.2em] text-[var(--text-secondary)]">
        Savings Rate
      </p>

      <div className="flex flex-1 items-center justify-center py-2">
        <div className="relative grid h-[84px] w-[84px] place-items-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
            <circle
              className="stroke-[#2e2922]"
              cx="48"
              cy="48"
              fill="none"
              r={RING_RADIUS}
              strokeWidth="10"
            />
            <circle
              className="stroke-[var(--accent-green)]"
              cx="48"
              cy="48"
              fill="none"
              r={RING_RADIUS}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              strokeWidth="10"
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <p
              className="text-[1.45rem] font-semibold leading-none tracking-[-0.05em] text-[var(--accent-green)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {progressPercent}%
            </p>
          </div>
        </div>
      </div>
      <p className="text-center font-sans text-[13px] font-medium leading-5 text-[var(--text-secondary)]">
        {formatRupiah(expense)} of {formatRupiah(baseline)}
      </p>
    </article>
  );
}
