"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Pencil,
  Trash2,
  Folder,
  Gamepad2,
  Heart,
  Home,
  ReceiptText,
  ShoppingBag,
  Tag,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "../../lib/api";

type CategoryCardProps = {
  category: Category;
  onDeleteClick: (category: Category) => void;
  onEditClick: (category: Category) => void;
};

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

export function CategoryCard({
  category,
  onDeleteClick,
  onEditClick,
}: CategoryCardProps) {
  const isIncome = category.type === "income";
  const TypeIcon = isIncome ? ArrowDownLeft : ArrowUpRight;
  const Icon = iconMap[category.icon?.toLowerCase()];
  const color = getSafeHexColor(category.color, isIncome);

  return (
    <article className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:border-purple-400/30 hover:bg-white/[0.075] sm:gap-4">
      <div
        className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border text-white shadow-lg transition group-hover:scale-[1.03]"
        style={{
          backgroundColor: `${color}24`,
          borderColor: `${color}55`,
          color,
        }}
      >
        {Icon ? (
          <Icon className="h-6 w-6" />
        ) : (
          <span className="text-lg font-bold">
            {getCategoryMarker(category)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-white">
          {category.name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${
              isIncome
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-rose-400/20 bg-rose-500/10 text-rose-300"
            }`}
          >
            <TypeIcon className="h-3.5 w-3.5" />
            {category.type}
          </span>
          {category.icon ? (
            <span className="truncate text-xs text-white/35">
              {category.icon}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <button
          aria-label={`Edit ${category.name}`}
          className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:border-purple-400/40 hover:bg-white/10 hover:text-white"
          onClick={() => onEditClick(category)}
          type="button"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          aria-label={`Delete ${category.name}`}
          className="grid h-9 w-9 place-items-center rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-200 transition hover:bg-rose-500/20"
          onClick={() => onDeleteClick(category)}
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function getCategoryMarker(category: Category): string {
  if (category.icon && category.icon.length <= 2) {
    return category.icon;
  }

  return category.name.trim().charAt(0).toUpperCase() || "C";
}

function getSafeHexColor(color: string, isIncome: boolean): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color;
  }

  return isIncome ? "#22c55e" : "#fb7185";
}
