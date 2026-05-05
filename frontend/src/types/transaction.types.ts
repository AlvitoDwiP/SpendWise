import type { Category, CategoryType } from "@/types/category.types";

export type Transaction = {
  id: number;
  category_id: number;
  type: CategoryType;
  amount: number;
  title: string;
  note: string;
  transaction_date: string;
  category?: Category;
};

export type TransactionPayload = {
  category_id: number;
  type: CategoryType;
  amount: number;
  title: string;
  note?: string;
  transaction_date: string;
};

export type TransactionListParams = {
  limit?: number;
  offset?: number;
  type?: CategoryType;
  category_id?: number;
  start_date?: string;
  end_date?: string;
};

export type ReceiptScanCategorySuggestion = {
  id?: number;
  name?: string;
};

export type ReceiptScanSuggestion = {
  type?: CategoryType;
  amount?: number | null;
  transaction_date?: string;
  merchant?: string;
  note?: string;
  category_suggestion?: ReceiptScanCategorySuggestion | null;
  confidence?: number;
};
