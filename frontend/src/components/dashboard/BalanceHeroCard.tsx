"use client";

import { motion } from "framer-motion";

import { formatRupiah } from "../../lib/format";

type BalanceHeroCardProps = {
  balance: number;
  greeting?: string;
  monthlyIncome: number;
  onAddTransaction?: () => void;
  transactionCount: number;
  userName?: string;
};

export function BalanceHeroCard({
  balance,
  greeting,
  monthlyIncome,
  onAddTransaction,
  transactionCount,
  userName,
}: BalanceHeroCardProps) {
  const balanceTone = balance < 0 ? "text-red-400" : "text-white";

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/25 backdrop-blur-xl md:min-h-[250px] md:rounded-2xl md:p-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/25 via-transparent to-pink-500/10 blur-2xl md:from-purple-500/20" />
      <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-indigo-400/12 blur-3xl" />

      <div className="relative">
        {greeting && userName ? (
          <div className="mb-12 flex items-center gap-3 md:hidden">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
              {getInitial(userName)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-white">
                {greeting}, {userName} ☀️
              </h1>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/60">
                Manage your finances with confidence today.
              </p>
            </div>
          </div>
        ) : null}

        <p className="text-center text-sm font-medium text-white/55 md:text-left">
          Current Balance
        </p>
        <p
          className={`mt-4 break-words text-center text-[44px] font-semibold leading-none tracking-tight sm:text-5xl md:text-left md:text-6xl ${balanceTone}`}
        >
          {formatRupiah(balance)}
        </p>

        <div className="mx-auto mt-7 flex w-fit flex-wrap items-center gap-x-4 gap-y-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/65 md:mx-0">
          <span className="font-semibold text-emerald-400">
            +{formatRupiah(monthlyIncome)}
          </span>
          <span className="h-4 w-px bg-white/10" />
          <span>
            <span className="font-semibold text-purple-300">
              {transactionCount}
            </span>{" "}
            Transactions
          </span>
        </div>

        {onAddTransaction ? (
          <button
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.98] md:mt-6 md:w-auto"
            onClick={onAddTransaction}
            type="button"
          >
            Add Transaction
          </button>
        ) : null}
      </div>
    </motion.section>
  );
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}
