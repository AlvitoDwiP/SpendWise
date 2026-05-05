"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2, Wallet } from "lucide-react";
import { motion } from "framer-motion";

import { formatDate, formatRupiah } from "@/lib/format";
import type { Transaction } from "@/types/transaction.types";

type MobileRecentTransactionsProps = {
  onDeleteTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  transactions: Transaction[];
};

export function MobileRecentTransactions({
  onDeleteTransaction,
  onEditTransaction,
  transactions,
}: MobileRecentTransactionsProps) {
  const visibleTransactions = transactions.slice(0, 4);

  return (
    <section className="px-7 md:hidden">
      <div className="rounded-[28px] border border-[var(--border-muted)] bg-[var(--surface-base)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Transactions</h2>
          <Link
            className="text-sm font-medium text-[var(--accent-cream)] transition hover:text-[var(--text-primary)]"
            href="/transactions"
          >
            See All
          </Link>
        </div>

        <div className="mt-4 space-y-2.5">
          {visibleTransactions.length === 0 ? (
            <div className="rounded-[22px] border border-[var(--border-muted)] bg-[var(--surface-elevated)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]">
              No recent transactions yet.
            </div>
          ) : (
            visibleTransactions.map((transaction, index) => (
              <MobileTransactionRow
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
    </section>
  );
}

function MobileTransactionRow({
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
  const title = transaction.note?.trim() || transaction.title;
  const categoryName = transaction.category?.name ?? "Uncategorized";

  return (
    <motion.article
      className="flex items-center gap-3 rounded-[22px] border border-[var(--border-muted)] bg-[var(--surface-elevated)] p-3.5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.04, duration: 0.26 }}
    >
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
          isExpense
            ? "bg-[var(--accent-red-soft)] text-[var(--accent-red)]"
            : "bg-[var(--accent-green-soft)] text-[var(--accent-green)]"
        }`}
      >
        <RowIcon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="truncate">{categoryName}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
          <span>{formatDate(transaction.transaction_date)}</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`flex items-center justify-end gap-1 text-sm font-semibold ${
            isExpense ? "text-[var(--accent-red)]" : "text-[var(--accent-green)]"
          }`}
        >
          <AmountIcon className="h-3.5 w-3.5" />
          <span>
            {isExpense ? "-" : "+"}
            {formatRupiah(transaction.amount)}
          </span>
        </p>
        <div className="mt-2 flex items-center justify-end gap-1.5">
          <button
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-raised)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            onClick={() => onEditTransaction(transaction)}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent-red-soft)] text-[var(--accent-red)] transition hover:bg-[rgba(216,124,124,0.2)]"
            onClick={() => onDeleteTransaction(transaction)}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
