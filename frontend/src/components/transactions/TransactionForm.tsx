"use client";

import type { Category, CategoryType } from "../../lib/api";

export type TransactionField = "amount" | "categoryId" | "date" | "note";

export type TransactionFormValues = {
  type: CategoryType | "";
  amount: number | null;
  categoryId: string;
  date: string;
  note: string;
};

type TransactionFormProps = {
  categories: Category[];
  disabled?: boolean;
  helperText?: string;
  highlightedFields?: TransactionField[];
  values: TransactionFormValues;
  onChange: (values: TransactionFormValues) => void;
};

export function TransactionForm({
  categories,
  disabled = false,
  helperText,
  highlightedFields = [],
  values,
  onChange,
}: TransactionFormProps) {
  const highlighted = new Set(highlightedFields);
  const visibleCategories =
    values.type === ""
      ? categories
      : categories.filter((category) => category.type === values.type);

  const highlightClass =
    "border-amber-400/35 bg-amber-500/10 focus:border-amber-300/60 focus:ring-amber-400/25";

  return (
    <div className="space-y-4">
      {helperText ? (
        <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100">
          {helperText}
        </p>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/75">Type</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-[#232326] px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onChange={(event) => onChange({ ...values, type: event.target.value as CategoryType })}
          value={values.type}
        >
          <option value="">Select transaction type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/75">Amount</span>
        <input
          className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60 ${highlighted.has("amount") ? highlightClass : ""}`}
          disabled={disabled}
          inputMode="decimal"
          min="0"
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange({
              ...values,
              amount: nextValue === "" ? null : Number(nextValue),
            });
          }}
          placeholder="0"
          step="0.01"
          type="number"
          value={values.amount ?? ""}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/75">Category</span>
        <select
          className={`w-full rounded-xl border border-white/10 bg-[#232326] px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60 ${highlighted.has("categoryId") ? highlightClass : ""}`}
          disabled={disabled}
          onChange={(event) => onChange({ ...values, categoryId: event.target.value })}
          value={values.categoryId}
        >
          <option value="">Select category</option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.icon ? `${category.icon} ` : ""}
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/75">Date</span>
        <input
          className={`w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60 ${highlighted.has("date") ? highlightClass : ""}`}
          disabled={disabled}
          onChange={(event) => onChange({ ...values, date: event.target.value })}
          type="date"
          value={values.date}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/75">Note</span>
        <textarea
          className={`min-h-[84px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60 ${highlighted.has("note") ? highlightClass : ""}`}
          disabled={disabled}
          onChange={(event) => onChange({ ...values, note: event.target.value })}
          placeholder="Optional note"
          value={values.note}
        />
      </label>
    </div>
  );
}
