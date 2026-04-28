"use client";

import { ArrowDownLeft, Info, WalletCards } from "lucide-react";
import { motion } from "framer-motion";

import type { Transaction } from "../../lib/api";
import { formatDate, formatRupiah } from "../../lib/format";

type MobileBalancePanelProps = {
  expense: number;
  income: number;
  transactions: Transaction[];
};

export function MobileBalancePanel({
  expense,
  income,
  transactions,
}: MobileBalancePanelProps) {
  const totalRecentExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <motion.section
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 backdrop-blur-xl md:hidden"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.32 }}
    >
      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-white">Your Balance</h2>
            <Info className="h-4 w-4 text-white/35" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard amount={income} label="Income" tone="income" />
          <MobileStatCard amount={expense} label="Expenses" tone="expense" />
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="font-medium uppercase tracking-wide text-white/45">
            Recent
          </span>
          <span className="text-white/55">
            Total -{formatRupiah(totalRecentExpense)}
          </span>
        </div>

        <div className="space-y-1">
          {transactions.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.035] px-4 py-8 text-center text-sm text-white/45">
              No recent transactions yet.
            </div>
          ) : (
            transactions.slice(0, 4).map((transaction, index) => (
              <MobileTransactionItem
                index={index}
                key={transaction.id}
                transaction={transaction}
              />
            ))
          )}
        </div>
      </div>
    </motion.section>
  );
}

function MobileStatCard({
  amount,
  label,
  tone,
}: {
  amount: number;
  label: string;
  tone: "expense" | "income";
}) {
  const isIncome = tone === "income";
  const Icon = isIncome ? ArrowDownLeft : WalletCards;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-lg shadow-black/15">
      <div
        className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl ${
          isIncome
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm text-white/55">{label}</p>
      <p
        className={`mt-2 truncate text-lg font-semibold ${
          isIncome ? "text-green-400" : "text-red-400"
        }`}
      >
        {formatRupiah(amount)}
      </p>
    </div>
  );
}

function MobileTransactionItem({
  index,
  transaction,
}: {
  index: number;
  transaction: Transaction;
}) {
  const isExpense = transaction.type === "expense";
  const categoryName = transaction.category?.name ?? transaction.type;

  return (
    <motion.article
      className="flex items-center justify-between gap-3 rounded-2xl p-3 transition hover:bg-white/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.14 + index * 0.04, duration: 0.28 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
            isExpense
              ? "bg-red-500/10 text-red-300"
              : "bg-green-500/10 text-green-300"
          }`}
        >
          {transaction.category?.icon ? (
            <span aria-hidden className="text-xl">
              {transaction.category.icon}
            </span>
          ) : (
            <WalletCards className="h-6 w-6" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate font-semibold text-white">
            {transaction.title}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-purple-200">
              {categoryName}
            </span>
            {transaction.note ? (
              <span className="truncate text-xs text-white/35">
                {transaction.note}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`font-semibold ${
            isExpense ? "text-red-400" : "text-green-400"
          }`}
        >
          {isExpense ? "-" : "+"}
          {formatRupiah(transaction.amount)}
        </p>
        <p className="mt-2 text-xs text-white/35">
          {formatDate(transaction.transaction_date)}
        </p>
      </div>
    </motion.article>
  );
}
