"use client";

import { Transaction, Category } from "../../lib/api";
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
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16 backdrop-blur-sm">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-lg font-medium text-white">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-400">{emptyDescription}</p>
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
