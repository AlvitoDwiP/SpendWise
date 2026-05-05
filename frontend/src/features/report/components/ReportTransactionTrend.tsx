import { formatCompactRupiah } from "@/lib/format";

type TrendItem = {
  key: string;
  label: string;
  expense: number;
};

type ReportTransactionTrendProps = {
  items: TrendItem[];
};

export function ReportTransactionTrend({ items }: ReportTransactionTrendProps) {
  const peak = items.reduce((max, item) => Math.max(max, item.expense), 0);

  return (
    <section className="warm-panel-compact p-4">
      <h2 className="section-title">Expense Trend</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Simple trend from selected period.</p>

      {items.length === 0 ? (
        <p className="warm-elevated mt-5 px-3 py-4 text-sm text-[var(--text-secondary)]">
          Not enough data for trend.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
          {items.map((item) => {
            const ratio = peak === 0 ? 0 : item.expense / peak;
            const height = Math.max(10, Math.round(ratio * 88));

            return (
              <div className="flex min-w-0 flex-col items-center" key={item.key}>
                <div className="flex h-24 w-full items-end justify-center rounded-[14px] border border-[var(--border-muted)] bg-[var(--surface-input)] px-1 pb-1">
                  <div
                    className="w-full rounded-md bg-[linear-gradient(180deg,rgba(216,124,124,0.82),rgba(166,79,79,0.95))]"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${formatCompactRupiah(item.expense)}`}
                  />
                </div>
                <p className="mt-2 w-full truncate text-center text-[11px] text-[var(--text-secondary)]">{item.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export type { TrendItem };
