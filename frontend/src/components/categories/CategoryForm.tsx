"use client";

import type { CategoryType } from "../../lib/api";

type CategoryFormProps = {
  name: string;
  type: CategoryType | "";
  disabled?: boolean;
  onNameChange: (value: string) => void;
  onTypeChange: (value: CategoryType) => void;
};

const typeOptions: Array<{ label: string; value: CategoryType }> = [
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
];

export function CategoryForm({
  name,
  type,
  disabled = false,
  onNameChange,
  onTypeChange,
}: CategoryFormProps) {
  return (
    <>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/75">Name</span>
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          maxLength={60}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Example: Salary, Groceries"
          type="text"
          value={name}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/75">Type</span>
        <select
          className="w-full rounded-xl border border-white/10 bg-[#232326] px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/25 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onChange={(event) => onTypeChange(event.target.value as CategoryType)}
          value={type}
        >
          <option value="">Select category type</option>
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
