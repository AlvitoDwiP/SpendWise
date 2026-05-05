"use client";

import DatePicker from "react-datepicker";

import type { Category, CategoryType } from "@/types/category.types";
import { formatRupiahNumber, parseRupiahInput } from "@/lib/format";
import type { TransactionField, TransactionFormValues } from "@/features/transactions/types";
import { isValidDate } from "@/features/transactions/utils";

type TransactionFormProps = {
  categories: Category[];
  disabled?: boolean;
  helperText?: string;
  highlightedFields?: TransactionField[];
  initialData?: Partial<TransactionFormValues>;
  mode?: "create" | "edit";
  values: TransactionFormValues;
  onChange: (values: TransactionFormValues) => void;
};

export function TransactionForm({
  categories,
  disabled = false,
  helperText,
  highlightedFields = [],
  initialData,
  mode = "create",
  values,
  onChange,
}: TransactionFormProps) {
  const effectiveValues = {
    ...initialData,
    ...values,
  };
  const highlighted = new Set(highlightedFields);
  const visibleCategories =
    effectiveValues.type === ""
      ? categories
      : categories.filter((category) => category.type === effectiveValues.type);

  const highlightClass = "border-[rgba(216,168,95,0.28)] bg-[var(--accent-warning-soft)]";

  return (
    <div className="space-y-4">
      {helperText ? (
        <p className="alert-warning">
          {helperText}
        </p>
      ) : null}

      <label className="block">
        <span className="field-label">Type</span>
        <select
          className="input-base appearance-none"
          disabled={disabled}
          onChange={(event) =>
            onChange({
              ...effectiveValues,
              type: event.target.value as CategoryType,
            })
          }
          value={effectiveValues.type}
        >
          <option value="">
            {mode === "edit" ? "Update transaction type" : "Select transaction type"}
          </option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </label>

      <label className="block">
        <span className="field-label">Amount</span>
        <input
          className={`input-base text-[18px] font-semibold tracking-[-0.02em] ${highlighted.has("amount") ? highlightClass : ""}`}
          disabled={disabled}
          inputMode="numeric"
          min="0"
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange({
              ...effectiveValues,
              amount: parseRupiahInput(nextValue),
            });
          }}
          placeholder="0"
          type="text"
          value={
            effectiveValues.amount === null
              ? ""
              : formatRupiahNumber(effectiveValues.amount)
          }
        />
      </label>

      <label className="block">
        <span className="field-label">Category</span>
        <select
          className={`input-base appearance-none ${highlighted.has("categoryId") ? highlightClass : ""}`}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...effectiveValues, categoryId: event.target.value })
          }
          value={effectiveValues.categoryId}
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
        <span className="field-label">Date</span>
        <DatePicker
          calendarClassName="!rounded-[24px] !border !border-[var(--border-muted)] !bg-[var(--surface-base)] !text-[var(--text-primary)] !shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
          className={`input-base ${highlighted.has("date") ? highlightClass : ""}`}
          dateFormat="dd MMM yyyy"
          disabled={disabled}
          onChange={(date: Date | null) =>
            onChange({
              ...effectiveValues,
              date: date ? new Date(date) : null,
            })
          }
          placeholderText="Select date"
          popperClassName="z-[80]"
          selected={isValidDate(effectiveValues.date) ? effectiveValues.date : null}
          wrapperClassName="w-full"
        />
      </label>

      <label className="block">
        <span className="field-label">Note</span>
        <textarea
          className={`input-base textarea-base ${highlighted.has("note") ? highlightClass : ""}`}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...effectiveValues, note: event.target.value })
          }
          placeholder="Optional note"
          value={effectiveValues.note}
        />
      </label>
    </div>
  );
}
