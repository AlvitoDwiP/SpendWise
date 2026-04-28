"use client";

import { Trash2 } from "lucide-react";
import { Transaction, Category } from "../../lib/api";

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | null;
  onDelete: (id: number) => void;
}

export function TransactionItem({
  transaction,
  category,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? "text-green-400" : "text-red-400";
  const categoryBgColor = category
    ? category.color || "bg-slate-700"
    : "bg-slate-700";

  const formattedAmount = isIncome
    ? `+${transaction.amount.toLocaleString()}`
    : `-${transaction.amount.toLocaleString()}`;

  const date = new Date(transaction.transaction_date);
  const dateStr = date.toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10">
      {/* Category Icon */}
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${categoryBgColor} text-lg`}
      >
        {category?.icon || "💰"}
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{transaction.title}</p>
        <p className="text-sm text-slate-400">
          {category?.name || "Unknown"}
          {transaction.note && ` • ${transaction.note}`}
        </p>
      </div>

      {/* Date */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <p className={`text-lg font-semibold ${amountColor}`}>
          {formattedAmount}
        </p>
        <p className="text-xs text-slate-500">{dateStr}</p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(transaction.id)}
        className="ml-2 flex-shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
        title="Delete transaction"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
