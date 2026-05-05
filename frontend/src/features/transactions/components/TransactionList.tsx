"use client";

import type { Category } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";
import { TransactionItem } from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Map<number, Category>;
  emptyDescription?: string;
  emptyTitle?: string;
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionList({
  transactions,
  categories,
  emptyDescription = "Try adjusting your filters or add a new transaction",
  emptyTitle = "No transactions found",
  onEdit,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="state-card flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-[var(--border-muted)] bg-[var(--surface-raised)] text-2xl text-[var(--text-muted)]">◎</div>
        <p className="text-lg font-medium text-[var(--text-primary)]">{emptyTitle}</p>
        <p className="mt-2 max-w-[18rem] text-sm leading-6 text-[var(--text-secondary)]">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          category={categories.get(transaction.category_id) || null}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
