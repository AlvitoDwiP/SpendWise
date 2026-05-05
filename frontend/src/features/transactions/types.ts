import type { CategoryType } from "@/types/category.types";

export type TransactionField = "amount" | "categoryId" | "date" | "note";

export type TransactionFormValues = {
  amount: number | null;
  categoryId: string;
  date: Date | null;
  note: string;
  type: CategoryType | "";
};
