import type { Transaction } from "@/lib/api";
import { formatCompactRupiah } from "@/lib/format";

type SpendingOverviewProps = {
  transactions: Transaction[];
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

export function SpendingOverview({ transactions }: SpendingOverviewProps) {
  const values = buildMonthlyExpenseValues(transactions);
  const maxValue = Math.max(...values, 1);
  const hasData = values.some((value) => value > 0);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Spending Overview</h2>
        <div className="flex rounded-2xl bg-white/[0.05] p-1 text-sm text-slate-400">
          <span className="rounded-xl px-4 py-2">Week</span>
          <span className="rounded-xl bg-[#11131d] px-4 py-2 font-semibold text-white shadow-lg">
            Month
          </span>
          <span className="rounded-xl px-4 py-2">Year</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-[3rem_1fr] gap-4">
        <div className="flex h-56 flex-col justify-between text-sm text-slate-500">
          <span>{formatCompactRupiah(maxValue)}</span>
          <span>{formatCompactRupiah(Math.round(maxValue * 0.66))}</span>
          <span>{formatCompactRupiah(Math.round(maxValue * 0.33))}</span>
          <span>0</span>
        </div>
        <div className="relative flex h-56 items-end justify-between gap-4 border-b border-white/10">
          <div className="absolute inset-x-0 bottom-1/3 border-t border-white/[0.04]" />
          <div className="absolute inset-x-0 bottom-2/3 border-t border-white/[0.04]" />
          {values.map((value, index) => {
            const height = hasData ? Math.max((value / maxValue) * 100, 3) : 2;

            return (
              <div
                className="relative flex h-full flex-1 flex-col items-center justify-end gap-3"
                key={monthLabels[index]}
              >
                <div
                  className={`w-full max-w-12 rounded-t-xl ${
                    value > 0
                      ? "bg-gradient-to-t from-purple-700 to-fuchsia-400 shadow-lg shadow-purple-950/50"
                      : "bg-white/10"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="absolute -bottom-8 text-sm text-slate-500">
                  {monthLabels[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function buildMonthlyExpenseValues(transactions: Transaction[]): number[] {
  const values = Array.from({ length: monthLabels.length }, () => 0);

  transactions.forEach((transaction) => {
    if (transaction.type !== "expense") {
      return;
    }

    const monthIndex = new Date(transaction.transaction_date).getMonth();
    if (monthIndex >= 0 && monthIndex < values.length) {
      values[monthIndex] += transaction.amount;
    }
  });

  return values;
}
