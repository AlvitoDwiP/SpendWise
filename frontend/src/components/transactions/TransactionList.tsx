"use client";

import { Transaction, Category } from "../../lib/api";
import { TransactionItem } from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Map<number, Category>;
  onDelete: (id: number) => void;
}

export function TransactionList({
  transactions,
  categories,
  onDelete,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-16 backdrop-blur-sm">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-lg font-medium text-white">No transactions found</p>
        <p className="text-sm text-slate-400 mt-2">
          Try adjusting your filters or add a new transaction
        </p>
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
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
