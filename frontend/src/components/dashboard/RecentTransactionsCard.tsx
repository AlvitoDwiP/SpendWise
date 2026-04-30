"use client";

import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";

import type { Transaction } from "../../lib/api";
import { formatDate, formatRupiah } from "../../lib/format";

type RecentTransactionsCardProps = {
  onDeleteTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  transactions: Transaction[];
};

export function RecentTransactionsCard({
  onDeleteTransaction,
  onEditTransaction,
  transactions,
}: RecentTransactionsCardProps) {
  return (
    <section className="min-h-[420px] rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white">Recent Transactions</h2>
        <button className="text-sm font-medium text-purple-300" type="button">
          See all
        </button>
      </div>

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-white/45">
            No recent transactions yet.
          </div>
        ) : (
          transactions.map((transaction, index) => (
            <TransactionItem
              index={index}
              key={transaction.id}
              onDeleteTransaction={onDeleteTransaction}
              onEditTransaction={onEditTransaction}
              transaction={transaction}
            />
          ))
        )}
      </div>
    </section>
  );
}

function TransactionItem({
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
  const AmountIcon = isExpense ? ArrowUpRight : ArrowDownLeft;
  const RowIcon = isExpense ? ArrowUpRight : Wallet;
  const topText = transaction.note?.trim() || transaction.title;
  const categoryName = transaction.category?.name ?? "Uncategorized";

  return (
    <motion.article
      className="group flex items-center justify-between gap-3 rounded-xl p-4 transition hover:bg-white/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onEditTransaction(transaction)}
      transition={{ delay: 0.12 + index * 0.04, duration: 0.28 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
            isExpense
              ? "bg-red-500/10 text-red-300"
              : "bg-emerald-500/10 text-emerald-300"
          }`}
        >
          <RowIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate font-medium text-white">{topText}</p>
          <p className="mt-1 truncate text-xs text-white/55">{categoryName}</p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`flex items-center justify-end gap-1 font-semibold ${
            isExpense ? "text-red-400" : "text-emerald-400"
          }`}
        >
          <AmountIcon className="h-4 w-4" />
          <span>
            {isExpense ? "-" : "+"}
            {formatRupiah(transaction.amount)}
          </span>
        </p>
        <p className="mt-1 text-xs text-white/35">{formatDate(transaction.transaction_date)}</p>
        <div className="mt-2 flex items-center justify-end gap-1">
          <button
            className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
            onClick={(event) => {
              event.stopPropagation();
              onEditTransaction(transaction);
            }}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="grid h-11 w-11 place-items-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteTransaction(transaction);
            }}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
