"use client";

import { BriefcaseBusiness, ListOrdered, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { formatCompactRupiah, formatRupiah } from "@/lib/format";

type BalanceStatsCardsProps = {
  expense: number;
  income: number;
  monthLabel: string;
  transactionCount: number;
};

const stats = [
  {
    key: "income",
    tone: "text-[var(--accent-green)]",
    iconTone: "border border-[rgba(95,197,142,0.28)] bg-[var(--accent-green-soft)] text-[var(--accent-green)]",
    icon: TrendingUp,
  },
  {
    key: "expense",
    tone: "text-[var(--accent-red)]",
    iconTone: "border border-[rgba(216,124,124,0.28)] bg-[var(--accent-red-soft)] text-[var(--accent-red)]",
    icon: BriefcaseBusiness,
  },
  {
    key: "transactions",
    tone: "text-[var(--accent-purple)]",
    iconTone: "border border-[rgba(169,155,232,0.28)] bg-[var(--accent-purple-soft)] text-[var(--accent-purple)]",
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
            className="warm-panel-compact min-h-0 p-3 transition-all md:min-h-36 md:p-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.key}
            transition={{ delay: 0.08 + index * 0.05, duration: 0.32 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className={`mb-2 grid h-8 w-8 place-items-center rounded-xl ${item.iconTone} md:mb-5 md:h-12 md:w-12 md:rounded-2xl`}>
              <Icon className="h-4 w-4 md:h-6 md:w-6" />
            </div>
            <p className="eyebrow-label md:hidden">{mobileLabels[item.key]}</p>
            <p className="eyebrow-label hidden md:block">{labels[item.key]}</p>
            <p className={`mt-1 text-sm font-semibold ${item.tone} md:mt-2 md:font-normal`}>
              <span className="md:hidden">{compactValues[item.key]}</span>
              <span className="metric-value hidden md:inline">{values[item.key]}</span>
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}
