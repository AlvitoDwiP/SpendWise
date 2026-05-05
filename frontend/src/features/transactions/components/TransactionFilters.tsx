"use client";

import type { CategoryType } from "@/types/category.types";

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
    <div className="warm-panel-compact app-card-pad space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "income", "expense"] as const).map((option) => (
          <button
            key={option}
            className={`chip-base ${
              type === option
                ? option === "income"
                  ? "chip-active-green"
                  : option === "expense"
                    ? "chip-active-red"
                    : "chip-active-cream"
                : ""
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
        <span className="field-label">Search</span>
        <input
          className="input-base"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search note or category..."
          type="text"
          value={search}
        />
      </label>
    </div>
  );
}
