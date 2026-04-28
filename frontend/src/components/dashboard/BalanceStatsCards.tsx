"use client";

import { BriefcaseBusiness, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { formatRupiah } from "../../lib/format";

type BalanceStatsCardsProps = {
  expense: number;
  income: number;
};

const stats = [
  {
    key: "income",
    label: "Income",
    tone: "text-green-400",
    iconTone: "bg-green-500/20 text-green-400",
    icon: TrendingUp,
  },
  {
    key: "expense",
    label: "Expenses",
    tone: "text-red-400",
    iconTone: "bg-red-500/20 text-red-400",
    icon: BriefcaseBusiness,
  },
] as const;

export function BalanceStatsCards({ expense, income }: BalanceStatsCardsProps) {
  const values = {
    income,
    expense,
  };

  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.article
            className="min-h-40 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition-all"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            key={item.key}
            transition={{ delay: 0.08 + index * 0.05, duration: 0.32 }}
            whileHover={{ scale: 1.02 }}
          >
            <div
              className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ${item.iconTone}`}
            >
              <Icon className="h-7 w-7" />
            </div>
            <p className="text-sm text-white/55">{item.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${item.tone}`}>
              {formatRupiah(values[item.key])}
            </p>
          </motion.article>
        );
      })}
    </div>
  );
}
