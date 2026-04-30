"use client";

import type { CategoryType } from "../../lib/api";

interface TransactionFiltersProps {
  search: string;
  type: CategoryType | "all";
  onSearchChange: (value: string) => void;
  onTypeChange: (type: CategoryType | "all") => void;
}

export function TransactionFilters({
  search,
  type,
  onSearchChange,
  onTypeChange,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2">
        {(["all", "income", "expense"] as const).map((option) => (
          <button
            key={option}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              type === option
                ? "bg-purple-500/20 text-purple-200"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
            onClick={() => onTypeChange(option)}
            type="button"
          >
            {option === "all"
              ? "All"
              : option === "income"
                ? "Income"
                : "Expense"}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-300">Search</span>
        <input
          className="w-full rounded-lg bg-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-400 transition-colors focus:bg-slate-600/50 focus:outline-none"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search note or category..."
          type="text"
          value={search}
        />
      </label>
    </div>
  );
}
