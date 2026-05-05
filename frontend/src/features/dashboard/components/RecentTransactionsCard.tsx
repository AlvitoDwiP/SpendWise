"use client";

import Link from "next/link";
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight, Wallet } from "lucide-react";
import { motion } from "framer-motion";

import type { Transaction } from "@/types/transaction.types";
import { formatDate, formatRupiah } from "@/lib/format";

type RecentTransactionsCardProps = {
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  onDeleteTransaction: (transaction: Transaction) => void;
  onEditTransaction: (transaction: Transaction) => void;
  seeAllHref?: string;
  transactions: Transaction[];
};

export function RecentTransactionsCard({
  emptyActionHref,
  emptyActionLabel,
  emptyDescription = "No recent transactions yet.",
  emptyTitle,
  onDeleteTransaction,
  onEditTransaction,
  seeAllHref = "/transactions",
  transactions,
}: RecentTransactionsCardProps) {
  const visibleTransactions = transactions.slice(0, 4);

  return (
    <section className="rounded-[28px] border border-[var(--border-muted)] bg-[var(--surface-base)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)]">Recent Transactions</h2>
        <Link
          className="rounded-md px-2 py-1 font-sans text-sm font-medium text-[#c8bba8] transition hover:text-[var(--accent-cream)]"
          href={seeAllHref}
        >
          See All
        </Link>
      </div>

      <div className="mt-4 space-y-2.5">
        {visibleTransactions.length === 0 ? (
          <div className="rounded-[22px] border border-[var(--border-muted)] bg-[var(--surface-elevated)] px-4 py-8 text-center font-sans">
            {emptyTitle ? (
              <p className="text-sm font-semibold text-[var(--text-primary)]">{emptyTitle}</p>
            ) : null}
            <p className={`text-sm text-[var(--text-secondary)] ${emptyTitle ? "mt-2" : ""}`}>
              {emptyDescription}
            </p>
            {emptyActionHref && emptyActionLabel ? (
              <Link className="auth-login-btn mx-auto mt-4 h-10 px-4 text-sm" href={emptyActionHref}>
                {emptyActionLabel}
              </Link>
            ) : null}
          </div>
        ) : (
          visibleTransactions.map((transaction, index) => (
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
      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-[22px] border border-[var(--border-muted)] bg-[var(--surface-elevated)] px-4 py-3.5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onEditTransaction(transaction)}
      transition={{ delay: 0.12 + index * 0.04, duration: 0.28 }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
            isExpense
              ? "border border-[rgba(216,124,124,0.28)] bg-[var(--accent-red-soft)] text-[var(--accent-red)]"
              : "border border-[rgba(95,197,142,0.28)] bg-[var(--accent-green-soft)] text-[var(--accent-green)]"
          }`}
        >
          <RowIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-[15px] font-medium leading-5 text-[var(--text-primary)]">{topText}</p>
          <p className="mt-1 truncate font-sans text-xs leading-5 text-[var(--text-secondary)]">{categoryName}</p>
        </div>
      </div>

      <div className="flex min-w-[152px] flex-col items-end text-right">
        <p
          className={`flex items-center justify-end gap-1 font-sans text-[15px] font-semibold leading-5 ${
            isExpense ? "text-[var(--accent-red)]" : "text-[var(--accent-green)]"
          }`}
        >
          <AmountIcon className="h-4 w-4" />
          <span>
            {isExpense ? "-" : "+"}
            {formatRupiah(transaction.amount)}
          </span>
        </p>
        <p className="mt-1 font-sans text-xs leading-5 text-[var(--text-muted)]">{formatDate(transaction.transaction_date)}</p>
        <div className="mt-3 flex items-center justify-end gap-1.5">
          <button
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border-muted)] bg-[var(--surface-raised)] text-[var(--text-secondary)] transition hover:bg-[var(--surface-base)] hover:text-[var(--text-primary)]"
            onClick={(event) => {
              event.stopPropagation();
              onEditTransaction(transaction);
            }}
            type="button"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(216,124,124,0.28)] bg-[var(--accent-red-soft)] text-[var(--accent-red)] transition hover:bg-[rgba(216,124,124,0.2)]"
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
