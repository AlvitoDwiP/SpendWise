"use client";

import type { CategoryType } from "@/types/category.types";

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
        <span className="field-label">Name</span>
        <input
          className="input-base"
          disabled={disabled}
          maxLength={60}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Example: Salary, Groceries"
          type="text"
          value={name}
        />
      </label>

      <label className="block">
        <span className="field-label">Type</span>
        <select
          className="input-base appearance-none"
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
