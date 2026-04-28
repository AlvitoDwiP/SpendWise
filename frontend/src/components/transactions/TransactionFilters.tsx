"use client";

import { Category, CategoryType } from "../../lib/api";

interface TransactionFiltersProps {
  type: CategoryType | "all";
  categoryId: number | "";
  startDate: string;
  endDate: string;
  categories: Category[];
  onTypeChange: (type: CategoryType | "all") => void;
  onCategoryChange: (categoryId: number | "") => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

export function TransactionFilters({
  type,
  categoryId,
  startDate,
  endDate,
  categories,
  onTypeChange,
  onCategoryChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: TransactionFiltersProps) {
  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const visibleCategories =
    type === "income" ? incomeCategories : type === "expense" ? expenseCategories : categories;

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-5 md:gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as CategoryType | "all")}
            className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:bg-slate-600/50"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) =>
              onCategoryChange(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:bg-slate-600/50"
          >
            <option value="">All Categories</option>
            {visibleCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:bg-slate-600/50"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:bg-slate-600/50"
          />
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600/50 md:py-2"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
