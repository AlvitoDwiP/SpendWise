"use client";

import { motion } from "framer-motion";

import type { Transaction } from "../../lib/api";
import { formatCompactRupiah } from "../../lib/format";

type SpendingOverviewCardProps = {
  monthlyExpense: number;
  transactions: Transaction[];
};

const ranges = ["Week", "Month", "Year"];

export function SpendingOverviewCard({
  monthlyExpense,
  transactions,
}: SpendingOverviewCardProps) {
  const chart = buildExpenseChart(transactions, monthlyExpense);
  const values = chart.map((item) => item.value);
  const maxValue = Math.max(...values, 1);
  const hasData = values.some((value) => value > 0);

  return (
    <section className="min-h-[360px] rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Spending Overview</h2>
        <div className="flex rounded-full bg-white/5 p-1 text-xs text-white/50">
          {ranges.map((range) => (
            <button
              className={`rounded-full px-3 py-1.5 transition ${
                range === "Month" ? "bg-white/10 text-white" : "hover:text-white"
              }`}
              key={range}
              type="button"
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-[2.75rem_1fr] gap-4">
        <div className="flex h-56 flex-col justify-between text-xs text-white/35">
          <span>{formatCompactRupiah(maxValue)}</span>
          <span>{formatCompactRupiah(Math.round(maxValue * 0.66))}</span>
          <span>{formatCompactRupiah(Math.round(maxValue * 0.33))}</span>
          <span>0</span>
        </div>

        <div className="relative flex h-56 items-end justify-between gap-3 border-b border-white/10">
          <div className="absolute inset-x-0 bottom-1/3 border-t border-white/[0.05]" />
          <div className="absolute inset-x-0 bottom-2/3 border-t border-white/[0.05]" />
          {chart.map((item, index) => {
            const height = hasData
              ? Math.max((item.value / maxValue) * 100, 4)
              : 3;

            return (
              <div
                className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                key={item.key}
              >
                <motion.div
                  className={`w-full max-w-10 origin-bottom rounded-t-xl ${
                    item.value > 0
                      ? "bg-gradient-to-t from-purple-500 to-indigo-400 shadow-lg shadow-purple-500/20"
                      : "bg-white/10"
                  }`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.38 }}
                  style={{ height: `${height}%` }}
                />
                <span className="absolute -bottom-7 text-xs text-white/35">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function buildExpenseChart(
  transactions: Transaction[],
  monthlyExpense: number,
): {
  key: string;
  label: string;
  value: number;
}[] {
  const now = new Date();
  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  const months = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 6 + index, 1);

    return {
      key: getMonthKey(date),
      label: monthFormatter.format(date),
      value: 0,
    };
  });

  const monthIndexes = new Map(
    months.map((month, index) => [month.key, index] as const),
  );

  transactions.forEach((transaction) => {
    if (transaction.type !== "expense") {
      return;
    }

    const index = monthIndexes.get(getMonthKey(new Date(transaction.transaction_date)));
    if (index !== undefined) {
      months[index].value += transaction.amount;
    }
  });

  if (!months.some((month) => month.value > 0) && monthlyExpense > 0) {
    months[months.length - 1].value = monthlyExpense;
  }

  return months;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}
