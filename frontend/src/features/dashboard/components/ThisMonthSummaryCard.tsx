import { formatRupiah } from "@/lib/format";

type ThisMonthSummaryCardProps = {
  activeMonthExpense: number;
  compact?: boolean;
  net: number;
  totalExpenseAllTime: number;
  totalExpenseLast28Days: number;
  totalExpenseLast7Days: number;
};

export function ThisMonthSummaryCard({
  activeMonthExpense,
  compact = false,
  net,
  totalExpenseAllTime,
  totalExpenseLast28Days,
  totalExpenseLast7Days,
}: ThisMonthSummaryCardProps) {
  const avgDaily = totalExpenseLast7Days / 7;
  const avgWeekly = totalExpenseLast28Days / 4;
  const avgMonthly = activeMonthExpense > 0 ? activeMonthExpense : totalExpenseAllTime;

  return (
    <section className={`warm-panel-compact ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">Spending Insights</h2>
      <p className="mt-1 font-sans text-sm text-[var(--text-secondary)]">Short window averages for quick decisions.</p>
      <div className={`space-y-3 ${compact ? "mt-4" : "mt-5"}`}>
        <SummaryRow hint="Last 7 days" label="Avg daily spend" tone="expense" value={avgDaily} />
        <SummaryRow hint="Last 4 weeks" label="Avg weekly spend" tone="expense" value={avgWeekly} />
        <SummaryRow label="Avg monthly spend" tone="expense" value={avgMonthly} />
        <SummaryRow label="Net" tone={net < 0 ? "expense" : "income"} value={net} />
      </div>
    </section>
  );
}

function SummaryRow({
  hint,
  label,
  tone,
  value,
}: {
  hint?: string;
  label: string;
  tone: "income" | "expense";
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[rgba(59,52,43,0.75)] pb-3 font-sans text-sm text-[var(--text-secondary)]">
      <div>
        <p>{label}</p>
        {hint ? <p className="mt-0.5 font-sans text-xs text-[var(--text-muted)]">{hint}</p> : null}
      </div>
      <span className={`font-sans text-sm font-semibold ${tone === "income" ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
        {formatRupiah(Number.isFinite(value) ? value : 0)}
      </span>
    </div>
  );
}
