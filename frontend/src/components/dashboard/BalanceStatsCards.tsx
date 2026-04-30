"use client";

import { BriefcaseBusiness, ListOrdered, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { formatCompactRupiah, formatRupiah } from "../../lib/format";

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
  const compactValues = {
    expense: formatCompactRupiah(expense),
    income: formatCompactRupiah(income),
    transactions: new Intl.NumberFormat("id-ID").format(transactionCount),
  };

  const labels = {
    expense: `Expense, ${monthLabel}`,
    income: `Income, ${monthLabel}`,
    transactions: `Transactions, ${monthLabel}`,
  };
  const mobileLabels = {
    expense: "Expense",
    income: "Income",
    transactions: "Txns",
  };

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.article
            className="min-h-0 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-xl shadow-black/20 backdrop-blur-xl transition-all md:min-h-36 md:p-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.key}
            transition={{ delay: 0.08 + index * 0.05, duration: 0.32 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`mb-2 grid h-8 w-8 place-items-center rounded-xl ${item.iconTone} md:mb-5 md:h-12 md:w-12 md:rounded-2xl`}>
              <Icon className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <p className="text-xs text-white/55 md:hidden">{mobileLabels[item.key]}</p>
            <p className="hidden text-sm text-white/55 md:block">{labels[item.key]}</p>
            <p className={`mt-1 text-sm font-semibold ${item.tone} md:mt-2 md:text-2xl`}>
              <span className="md:hidden">{compactValues[item.key]}</span>
              <span className="hidden md:inline">{values[item.key]}</span>
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}
