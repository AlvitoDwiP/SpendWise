"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Car,
  Folder,
  Home,
  ShoppingBag,
  Tag,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Category } from "../../lib/api";

type CategoryCardProps = {
  category: Category;
};

const iconMap: Record<string, LucideIcon> = {
  car: Car,
  food: Utensils,
  folder: Folder,
  home: Home,
  shopping: ShoppingBag,
  "shopping-bag": ShoppingBag,
  "shopping-cart": ShoppingBag,
  tag: Tag,
  wallet: Wallet,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const isIncome = category.type === "income";
  const TypeIcon = isIncome ? ArrowDownLeft : ArrowUpRight;
  const Icon = iconMap[category.icon?.toLowerCase()];
  const color = getSafeHexColor(category.color, isIncome);

  return (
    <article className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:border-purple-400/30 hover:bg-white/[0.075]">
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
