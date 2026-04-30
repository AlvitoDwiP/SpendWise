"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import type { Transaction } from "../../lib/api";
import { formatCompactRupiah } from "../../lib/format";

type SpendingOverviewCardProps = {
  activeMonthKey: string;
  transactions: Transaction[];
};

type Mode = "days" | "weeks" | "month";

const modes: Array<{ key: Mode; label: string }> = [
  { key: "days", label: "Days" },
  { key: "weeks", label: "Weeks" },
  { key: "month", label: "Month" },
];

export function SpendingOverviewCard({
  activeMonthKey,
  transactions,
}: SpendingOverviewCardProps) {
  const [mode, setMode] = useState<Mode>("month");

  const chart = useMemo(
    () => buildExpenseChart(transactions, mode),
    [transactions, mode],
  );

  const values = chart.map((item) => item.value);
  const maxValue = Math.max(...values, 1);

  return (
    <section className="min-h-[320px] rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:min-h-[360px] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Spending Overview</h2>
        <div className="flex rounded-full bg-white/5 p-1 text-xs text-white/50">
          {modes.map((item) => (
            <button
              className={`rounded-full px-3 py-1.5 transition ${
                item.key === mode ? "bg-white/10 text-white" : "hover:text-white"
              }`}
              key={item.key}
              onClick={() => setMode(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-[2.5rem_1fr] gap-3 sm:grid-cols-[2.75rem_1fr] sm:gap-4">
        <div className="flex h-44 flex-col justify-between text-xs text-white/35 sm:h-56">
          <span>{formatCompactRupiah(maxValue)}</span>
          <span>{formatCompactRupiah(Math.round(maxValue * 0.66))}</span>
          <span>{formatCompactRupiah(Math.round(maxValue * 0.33))}</span>
          <span>0</span>
        </div>

        <div className="relative flex h-44 items-end justify-between gap-2 border-b border-white/10 sm:h-56 sm:gap-3">
          <div className="absolute inset-x-0 bottom-1/3 border-t border-white/[0.05]" />
          <div className="absolute inset-x-0 bottom-2/3 border-t border-white/[0.05]" />
          {chart.map((item, index) => {
            const height = Math.max((item.value / maxValue) * 100, 3);
            const isActiveMonth = mode === "month" && item.key === activeMonthKey;

            return (
              <div
                className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                key={item.key}
              >
                <motion.div
                  className={`w-full max-w-10 origin-bottom rounded-t-xl ${
                    item.value > 0
                      ? isActiveMonth
                        ? "bg-gradient-to-t from-emerald-500 to-green-300 shadow-lg shadow-emerald-500/20"
                        : "bg-gradient-to-t from-purple-500 to-indigo-400 shadow-lg shadow-purple-500/20"
                      : "bg-white/10"
                  }`}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.05 + index * 0.03, duration: 0.32 }}
                  style={{ height: `${height}%` }}
                />
                <span className={`absolute -bottom-7 text-[11px] sm:text-xs ${isActiveMonth ? "font-semibold text-emerald-300" : "text-white/35"}`}>
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
  mode: Mode,
): {
  key: string;
  label: string;
  value: number;
}[] {
  const expenses = transactions.filter((transaction) => transaction.type === "expense");
  const now = new Date();

  if (mode === "days") {
    const dayFormatter = new Intl.DateTimeFormat("en", { weekday: "short" });
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
      return {
        key: getDayKey(date),
        label: dayFormatter.format(date),
        value: 0,
      };
    });
    const map = new Map(days.map((item, index) => [item.key, index] as const));

    expenses.forEach((transaction) => {
      const index = map.get(getDayKey(new Date(transaction.transaction_date)));
      if (index !== undefined) {
        days[index].value += transaction.amount;
      }
    });

    return days;
  }

  if (mode === "weeks") {
    const weeks = Array.from({ length: 4 }, (_, index) => {
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (3 - index) * 7);
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
      return {
        key: `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}`,
        label: `W${index + 1}`,
        start,
        end,
        value: 0,
      };
    });

    expenses.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      weeks.forEach((week) => {
        if (date >= week.start && date <= week.end) {
          week.value += transaction.amount;
        }
      });
    });

    return weeks.map(({ end, key, label, value }) => ({
      key,
      label,
      value,
      sort: end.getTime(),
    }));
  }

  const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

    return {
      key: getMonthKey(date),
      label: monthFormatter.format(date),
      value: 0,
    };
  });

  const monthIndexes = new Map(
    months.map((month, index) => [month.key, index] as const),
  );

  expenses.forEach((transaction) => {
    const index = monthIndexes.get(getMonthKey(new Date(transaction.transaction_date)));
    if (index !== undefined) {
      months[index].value += transaction.amount;
    }
  });

  return months;
}

function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
