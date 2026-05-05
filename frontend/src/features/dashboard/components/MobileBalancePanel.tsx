"use client";

import { ArrowDownLeft, Info, Pencil, Trash2, WalletCards } from "lucide-react";
import { motion } from "framer-motion";

import type { Transaction } from "@/types/transaction.types";
import { formatDate, formatRupiah } from "@/lib/format";

type MobileBalancePanelProps = {
  expense: number;
  income: number;
  onDeleteTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  transactions: Transaction[];
};

export function MobileBalancePanel({
  expense,
  income,
  onDeleteTransaction,
  onEditTransaction,
  transactions,
}: MobileBalancePanelProps) {
  const totalRecentExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <motion.section
      className="w-full max-w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/25 backdrop-blur-xl md:hidden"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.32 }}
    >
      <div className="p-3.5 sm:p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Your Balance</h2>
            <Info className="h-3.5 w-3.5 text-white/35" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 min-[360px]:gap-3">
          <MobileStatCard amount={income} label="Income" tone="income" />
          <MobileStatCard amount={expense} label="Expenses" tone="expense" />
        </div>
      </div>

      <div className="border-t border-white/10 px-3.5 py-3.5 sm:px-5 sm:py-5">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-medium uppercase tracking-[0.14em] text-white/45">
            Recent
          </span>
          <span className="text-white/55">
            Total -{formatRupiah(totalRecentExpense)}
          </span>
        </div>

        <div className="space-y-1 min-w-0">
          {transactions.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.035] px-4 py-8 text-center text-sm text-white/45">
              No recent transactions yet.
            </div>
          ) : (
            transactions.slice(0, 4).map((transaction, index) => (
              <MobileTransactionItem
                index={index}
                key={transaction.id}
                onDeleteTransaction={onDeleteTransaction}
                onEditTransaction={onEditTransaction}
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
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.045] p-3 shadow-lg shadow-black/15 min-[360px]:p-3.5">
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${
          isIncome
            ? "bg-green-500/20 text-green-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="truncate text-xs text-white/55">{label}</p>
      <p
        className={`mt-1.5 max-w-full break-words text-sm font-semibold leading-tight min-[360px]:text-base ${
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
  onDeleteTransaction,
  onEditTransaction,
  transaction,
}: {
  index: number;
  onDeleteTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  transaction: Transaction;
}) {
  const isExpense = transaction.type === "expense";
  const categoryName = transaction.category?.name ?? transaction.type;

  return (
    <motion.article
      className="flex min-w-0 max-w-full items-center justify-between gap-2 rounded-xl p-2.5 transition hover:bg-white/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onEditTransaction(transaction)}
      transition={{ delay: 0.14 + index * 0.04, duration: 0.28 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            isExpense
              ? "bg-red-500/10 text-red-300"
              : "bg-green-500/10 text-green-300"
          }`}
        >
          {transaction.category?.icon ? (
            <span aria-hidden className="text-base">
              {transaction.category.icon}
            </span>
          ) : (
            <WalletCards className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {transaction.title}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-purple-200">
              {categoryName}
            </span>
            {transaction.note ? (
              <span className="truncate text-[11px] text-white/35">
                {transaction.note}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-w-0 shrink-0 text-right">
        <p
          className={`max-w-[38vw] truncate text-sm font-semibold min-[360px]:max-w-[42vw] ${
            isExpense ? "text-red-400" : "text-green-400"
          }`}
        >
          {isExpense ? "-" : "+"}
          {formatRupiah(transaction.amount)}
        </p>
        <p className="mt-1.5 text-[11px] text-white/35">
          {formatDate(transaction.transaction_date)}
        </p>
        <div className="mt-1.5 flex items-center justify-end gap-1">
          <button
            className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-white/5 text-white/70"
            onClick={(event) => {
              event.stopPropagation();
              onEditTransaction(transaction);
            }}
            type="button"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            className="grid h-6 w-6 place-items-center rounded-md border border-red-500/30 bg-red-500/10 text-red-300"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteTransaction(transaction);
            }}
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
