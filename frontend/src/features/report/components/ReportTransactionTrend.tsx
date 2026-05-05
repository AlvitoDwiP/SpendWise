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
    <section className="rounded-2xl border border-white/10 bg-[#1c1c1e]/85 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-white">Expense Trend</h2>
      <p className="mt-1 text-sm text-white/55">Simple trend from selected period.</p>

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-white/55">
          Not enough data for trend.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8">
          {items.map((item) => {
            const ratio = peak === 0 ? 0 : item.expense / peak;
            const height = Math.max(10, Math.round(ratio * 88));

            return (
              <div className="flex min-w-0 flex-col items-center" key={item.key}>
                <div className="flex h-24 w-full items-end justify-center rounded-lg bg-white/5 px-1 pb-1">
                  <div
                    className="w-full rounded-md bg-gradient-to-t from-purple-500 to-indigo-400"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${formatCompactRupiah(item.expense)}`}
                  />
                </div>
                <p className="mt-2 w-full truncate text-center text-[11px] text-white/60">{item.label}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export type { TrendItem };
