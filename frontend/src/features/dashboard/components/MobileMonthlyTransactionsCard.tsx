"use client";

import { CalendarDays } from "lucide-react";

type MobileMonthlyTransactionsCardProps = {
  monthLabel: string;
  transactionCount: number;
};

export function MobileMonthlyTransactionsCard({
  monthLabel,
  transactionCount,
}: MobileMonthlyTransactionsCardProps) {
  return (
    <article className="min-h-[156px] rounded-[24px] border border-[var(--border-muted)] bg-[var(--surface-base)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="grid h-12 w-12 place-items-center rounded-[14px] border border-[rgba(169,155,232,0.28)] bg-[var(--accent-purple-soft)] text-[var(--accent-purple)]">
        <CalendarDays className="h-[18px] w-[18px]" />
      </div>

      <p className="mt-4 max-w-full font-sans text-[12px] font-medium uppercase leading-5 tracking-[0.2em] text-[var(--text-secondary)]">
        Transactions, {monthLabel}
      </p>
      <p
        className="mt-3 text-[clamp(1.8rem,7vw,1.95rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--accent-purple)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {new Intl.NumberFormat("id-ID").format(transactionCount)}
      </p>
      <p className="mt-1.5 font-sans text-xs leading-5 text-[var(--text-secondary)]">Filtered by selected month</p>
    </article>
  );
}
