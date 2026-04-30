"use client";

import { BriefcaseBusiness, ListOrdered, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { formatRupiah } from "../../lib/format";

type BalanceStatsCardsProps = {
  expense: number;
  income: number;
  monthLabel: string;
  transactionCount: number;
};

const stats = [
  {
    key: "income",
    tone: "text-green-400",
    iconTone: "bg-green-500/20 text-green-400",
    icon: TrendingUp,
  },
  {
    key: "expense",
    tone: "text-red-400",
    iconTone: "bg-red-500/20 text-red-400",
    icon: BriefcaseBusiness,
  },
  {
    key: "transactions",
    tone: "text-purple-300",
    iconTone: "bg-purple-500/20 text-purple-300",
    icon: ListOrdered,
  },
] as const;

export function BalanceStatsCards({
  expense,
  income,
  monthLabel,
  transactionCount,
}: BalanceStatsCardsProps) {
  const values = {
    expense: formatRupiah(expense),
    income: formatRupiah(income),
    transactions: new Intl.NumberFormat("id-ID").format(transactionCount),
  };

  const labels = {
    expense: `Expense, ${monthLabel}`,
    income: `Income, ${monthLabel}`,
    transactions: `Transactions, ${monthLabel}`,
  };

  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.article
            className="min-h-36 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition-all"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.key}
            transition={{ delay: 0.08 + index * 0.05, duration: 0.32 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl ${item.iconTone}`}>
              <Icon className="h-6 w-6" />
            </div>
            <p className="text-sm text-white/55">{labels[item.key]}</p>
            <p className={`mt-2 text-2xl font-semibold ${item.tone}`}>{values[item.key]}</p>
          </motion.article>
        );
      })}
    </div>
  );
}
