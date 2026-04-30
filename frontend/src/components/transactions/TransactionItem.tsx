"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Folder,
  Gamepad2,
  Heart,
  Home,
  Pencil,
  ReceiptText,
  ShoppingBag,
  Tag,
  Trash2,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Transaction, Category } from "../../lib/api";
import { formatDate, formatRupiah } from "../../lib/format";

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | null;
  onDelete: (transaction: Transaction) => void;
  onEdit: (transaction: Transaction) => void;
}

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  food: Utensils,
  folder: Folder,
  home: Home,
  heart: Heart,
  medical: Heart,
  gamepad: Gamepad2,
  entertainment: Gamepad2,
  receipt: ReceiptText,
  "receipt-text": ReceiptText,
  shopping: ShoppingBag,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingBag,
  utensils: Utensils,
  tag: Tag,
  wallet: Wallet,
};

export function TransactionItem({
  transaction,
  category,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? "text-green-400" : "text-red-400";
  const fallbackColor = isIncome ? "#22c55e" : "#fb7185";
  const safeCategoryName = category?.name ?? transaction.category?.name ?? "Uncategorized";
  const rawIcon = category?.icon ?? transaction.category?.icon ?? "";
  const Icon = iconMap[rawIcon.toLowerCase()];
  const marker = getCategoryMarker(safeCategoryName);
  const topText = transaction.note?.trim() || transaction.title;
  const color = getSafeHexColor(category?.color ?? transaction.category?.color ?? "", fallbackColor);
  const TypeIcon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-purple-400/30 hover:bg-white/[0.075] sm:gap-4"
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
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border text-white"
        style={{
          backgroundColor: `${color}24`,
          borderColor: `${color}55`,
          color,
        }}
      >
        {Icon ? <Icon className="h-5 w-5" /> : <span className="text-base font-semibold">{marker}</span>}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white sm:text-base">{topText}</p>
        <p className="mt-1 truncate text-xs text-white/55 sm:text-sm">{safeCategoryName}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className={`flex items-center gap-1 text-base font-semibold sm:text-lg ${amountColor}`}>
          <TypeIcon className="h-4 w-4" />
          {isIncome ? "+" : "-"}
          {formatRupiah(transaction.amount)}
        </p>
        <p className="text-xs text-white/40">{formatDate(transaction.transaction_date)}</p>
      </div>

      <div className="ml-2 flex shrink-0 items-center gap-1">
        <button
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:border-purple-400/40 hover:bg-white/10 hover:text-white"
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
          className="grid h-9 w-9 place-items-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-200 transition hover:bg-rose-500/20"
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

function getCategoryMarker(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "C";
}

function getSafeHexColor(color: string, fallback: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color;
  }
  return fallback;
}
