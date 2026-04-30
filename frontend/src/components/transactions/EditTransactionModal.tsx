"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import {
  getCategories,
  updateTransaction,
  type Category,
  type CategoryType,
  type Transaction,
  type TransactionPayload,
} from "../../lib/api";
import { TransactionForm, type TransactionFormValues } from "./TransactionForm";
import { isValidDate, parseTransactionDate, toRFC3339 } from "./dateUtils";

type EditTransactionModalProps = {
  onClose: () => void;
  onUpdated: (transaction: Transaction) => void;
  transaction: Transaction;
};

export function EditTransactionModal({
  onClose,
  onUpdated,
  transaction,
}: EditTransactionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [error, setError] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<TransactionFormValues>(() =>
    toFormValues(transaction),
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setIsLoadingCategories(true);
      setCategoriesError("");
      try {
        const loaded = await getCategories();
        if (!isMounted) {
          return;
        }
        setCategories(loaded);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setCategoriesError(
          err instanceof Error ? err.message : "Failed to load categories.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.type) {
      setError("Transaction type is required.");
      return;
    }
    if (!Number.isFinite(formValues.amount) || formValues.amount === null || formValues.amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (!formValues.categoryId) {
      setError("Category is required.");
      return;
    }
    if (!isValidDate(formValues.date)) {
      setError("Date is required.");
      return;
    }

    const category = categories.find(
      (item) => item.id === Number(formValues.categoryId),
    );

    const payload: TransactionPayload = {
      amount: formValues.amount,
      category_id: Number(formValues.categoryId),
      note: formValues.note.trim() || undefined,
      title: buildTransactionTitle(formValues.type, category?.name),
      transaction_date: toRFC3339(formValues.date),
      type: formValues.type,
    };

    setError("");
    setIsSubmitting(true);
    try {
      const updated = await updateTransaction(transaction.id, payload);
      onUpdated({
        ...transaction,
        ...updated,
        category:
          updated.category ??
          category ??
          transaction.category,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transaction.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isSaveDisabled =
    isSubmitting ||
    isLoadingCategories ||
    !!categoriesError ||
    !formValues.type ||
    !formValues.categoryId ||
    !isValidDate(formValues.date) ||
    formValues.amount === null ||
    formValues.amount <= 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end px-4 pb-4 sm:place-items-center sm:p-6">
      <motion.button
        aria-label="Close edit transaction modal"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => {
          if (!isSubmitting) {
            onClose();
          }
        }}
        type="button"
      />

      <motion.section
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#1c1c1e]/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        role="dialog"
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">Edit Transaction</p>
            <p className="mt-1 text-sm leading-6 text-white/55">
              Update transaction details and save changes.
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {categoriesError ? (
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {categoriesError}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <TransactionForm
            categories={categories}
            disabled={isSubmitting || isLoadingCategories || !!categoriesError}
            initialData={toFormValues(transaction)}
            mode="edit"
            onChange={setFormValues}
            values={formValues}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaveDisabled}
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.section>
    </div>
  );
}

function toFormValues(transaction: Transaction): TransactionFormValues {
  return {
    amount: transaction.amount,
    categoryId: String(transaction.category_id),
    date: parseTransactionDate(transaction.transaction_date),
    note: transaction.note ?? "",
    type: transaction.type,
  };
}

function buildTransactionTitle(type: CategoryType, categoryName?: string): string {
  if (categoryName) {
    return `${type === "income" ? "Income" : "Expense"} - ${categoryName}`;
  }
  return type === "income" ? "Income Transaction" : "Expense Transaction";
}
