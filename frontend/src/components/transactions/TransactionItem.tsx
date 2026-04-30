"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Transaction, Category } from "../../lib/api";
import { formatDate, formatRupiah } from "../../lib/format";

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | null;
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionItem({
  transaction,
  category,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? "text-green-400" : "text-red-400";
  const safeCategoryName = category?.name ?? transaction.category?.name ?? "Unknown";
  const safeCategoryIcon = category?.icon ?? transaction.category?.icon ?? "💰";

  return (
    <div
      className="flex items-center gap-3 rounded-xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10"
      onClick={() => onEdit(transaction)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit(transaction);
        }
      }}
    >
      {/* Category Icon */}
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-700 text-lg"
        style={category?.color ? { backgroundColor: category.color } : undefined}
      >
        {safeCategoryIcon}
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{transaction.title}</p>
        <p className="truncate text-sm text-slate-400">
          {safeCategoryName}
          {transaction.note && ` • ${transaction.note}`}
        </p>
      </div>

      {/* Date */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <p className={`text-lg font-semibold ${amountColor}`}>
          {isIncome ? "+" : "-"}
          {formatRupiah(transaction.amount)}
        </p>
        <p className="text-xs text-slate-500">{formatDate(transaction.transaction_date)}</p>
      </div>

      <div className="ml-2 flex flex-shrink-0 items-center gap-1">
        <button
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(transaction);
          }}
          title="Edit transaction"
          type="button"
        >
          <Pencil size={16} />
        </button>
        <button
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(transaction);
          }}
          title="Delete transaction"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
