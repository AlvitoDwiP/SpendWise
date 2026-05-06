"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Receipt, X } from "lucide-react";

import {
  createTransaction,
  scanReceipt as scanReceiptApi,
} from "@/features/transactions/api";
import { getCategories } from "@/features/categories/api";
import {
  TransactionForm,
} from "./TransactionForm";
import type { TransactionField, TransactionFormValues } from "@/features/transactions/types";
import { isValidDate, toRFC3339 } from "@/features/transactions/utils";
import { ReceiptUploadStep } from "./ReceiptUploadStep";
import type { Category, CategoryType } from "@/types/category.types";
import type {
  ReceiptScanSuggestion,
  Transaction,
  TransactionPayload,
} from "@/types/transaction.types";

type AddTransactionModalProps = {
  onClose: () => void;
  onCreated: (transaction: Transaction) => void;
};

type ModalMode = "manual" | "scan";

type ScanSuggestion = {
  type: CategoryType;
  amount: number | null;
  categoryId: string;
  date: Date;
  note: string;
  confidence: number | null;
};

const scannedHighlightFields: TransactionField[] = [
  "amount",
  "categoryId",
  "date",
  "note",
];

export function AddTransactionModal({ onClose, onCreated }: AddTransactionModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [mode, setMode] = useState<ModalMode>("manual");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreviewUrl, setScanPreviewUrl] = useState("");
  const [scanSuggestionNotice, setScanSuggestionNotice] = useState("");
  const [scanConfidence, setScanConfidence] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<TransactionFormValues>(() =>
    defaultFormValues(),
  );

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === "expense"),
    [categories],
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

  useEffect(() => {
    return () => {
      if (scanPreviewUrl) {
        URL.revokeObjectURL(scanPreviewUrl);
      }
    };
  }, [scanPreviewUrl]);

  function handleFileChange(file: File | null) {
    setError("");
    setScanSuggestionNotice("");
    setScanConfidence(null);
    setScanFile(file);

    if (scanPreviewUrl) {
      URL.revokeObjectURL(scanPreviewUrl);
    }

    if (file) {
      setScanPreviewUrl(URL.createObjectURL(file));
    } else {
      setScanPreviewUrl("");
    }
  }

  async function handleScanReceipt() {
    if (!scanFile) {
      setError("Please upload or take a receipt photo first.");
      return;
    }

    setError("");
    setIsScanning(true);

    try {
      const suggestion = await scanReceipt(scanFile, expenseCategories);
      setFormValues((current) => ({
        ...current,
        amount: suggestion.amount,
        categoryId: suggestion.categoryId,
        date: suggestion.date,
        note: suggestion.note,
        type: suggestion.type,
      }));
      setMode("manual");
      setScanConfidence(suggestion.confidence);
      setScanSuggestionNotice(
        "Hasil scan hanya suggestion. Cek kembali sebelum menyimpan.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan receipt.");
    } finally {
      setIsScanning(false);
    }
  }

  function handleCloseModal() {
    setError("");
    setScanSuggestionNotice("");
    setScanConfidence(null);
    setScanFile(null);
    if (scanPreviewUrl) {
      URL.revokeObjectURL(scanPreviewUrl);
      setScanPreviewUrl("");
    }
    setFormValues(defaultFormValues());
    setMode("manual");
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.type) {
      setError("Transaction type is required.");
      return;
    }
    if (
      !Number.isFinite(formValues.amount) ||
      formValues.amount === null ||
      formValues.amount <= 0
    ) {
      setError("Amount harus diisi lebih dari 0 sebelum disimpan.");
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

    const category = categories.find((item) => item.id === Number(formValues.categoryId));

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
      const created = await createTransaction(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasAmountError =
    formValues.amount !== null &&
    (Number.isNaN(formValues.amount) || formValues.amount <= 0);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end px-4 pb-4 sm:place-items-center sm:p-6">
      <motion.button
        aria-label="Close add transaction modal"
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
            onClick={() => {
              if (!isSubmitting && !isScanning) {
                handleCloseModal();
              }
            }}
        type="button"
      />

      <motion.section
        aria-modal="true"
        className="modal-panel"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        role="dialog"
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="modal-handle" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="page-label">Add Transaction</p>
            <p className="mt-3 text-[30px] leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
              Add Transaction
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Add manually or use receipt-assisted input before saving.
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="icon-button shrink-0 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || isScanning}
            onClick={handleCloseModal}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-[22px] border border-[var(--border-muted)] bg-[var(--surface-input)] p-1">
          <button
            className={`btn-base min-h-[46px] rounded-[18px] px-3 text-sm ${
              mode === "manual"
                ? "chip-active-purple border border-[rgba(169,155,232,0.28)]"
                : "border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-base)]"
            }`}
            disabled={isSubmitting || isScanning}
            onClick={() => setMode("manual")}
            type="button"
          >
            Manual
          </button>
          <button
            className={`btn-base min-h-[46px] rounded-[18px] px-3 text-sm ${
              mode === "scan"
                ? "chip-active-purple border border-[rgba(169,155,232,0.28)]"
                : "border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-base)]"
            }`}
            disabled={isSubmitting || isScanning}
            onClick={() => setMode("scan")}
            type="button"
          >
            <Receipt className="h-4 w-4" />
            Receipt Assist
          </button>
        </div>

        {categoriesError ? (
          <p className="alert-error mt-4">
            {categoriesError}
          </p>
        ) : null}

        {scanSuggestionNotice ? (
          <div className="mt-4 space-y-2">
            {scanConfidence !== null ? (
              <div className="chip-base chip-active-cream min-h-[32px] px-3 text-xs">
                {toConfidenceLabel(scanConfidence)} confidence
              </div>
            ) : null}
            <p className="alert-warning">
              {scanSuggestionNotice}
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="alert-error mt-4">
            {error}
          </p>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {mode === "manual" ? (
            <TransactionForm
              categories={categories}
              disabled={isSubmitting || isLoadingCategories || !!categoriesError}
              helperText={
                scanSuggestionNotice
                  ? "Review suggestion and complete required fields before saving."
                  : undefined
              }
              highlightedFields={scanSuggestionNotice ? scannedHighlightFields : []}
              onChange={setFormValues}
              values={formValues}
            />
          ) : (
            <ReceiptUploadStep
              disabled={isSubmitting || isLoadingCategories || !!categoriesError}
              imageUrl={scanPreviewUrl}
              isScanning={isScanning}
              onFileChange={handleFileChange}
              onRemoveImage={() => handleFileChange(null)}
              onScan={handleScanReceipt}
            />
          )}

          {hasAmountError ? (
            <p className="alert-warning">
              Amount harus diisi lebih dari 0 sebelum disimpan.
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="btn-base btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || isScanning}
              onClick={handleCloseModal}
              type="button"
            >
              Cancel
            </button>
            <button
              className="btn-base btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                mode !== "manual" ||
                isSubmitting ||
                isScanning ||
                isLoadingCategories ||
                !!categoriesError ||
                !formValues.type ||
                !formValues.categoryId ||
                !isValidDate(formValues.date) ||
                formValues.amount === null ||
                formValues.amount <= 0
              }
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </form>
      </motion.section>
    </div>
  );
}

function defaultFormValues(): TransactionFormValues {
  return {
    amount: null,
    categoryId: "",
    date: new Date(),
    note: "",
    type: "expense",
  };
}

function buildTransactionTitle(type: CategoryType, categoryName?: string): string {
  if (categoryName) {
    return `${type === "income" ? "Income" : "Expense"} - ${categoryName}`;
  }
  return type === "income" ? "Income Transaction" : "Expense Transaction";
}

function pickBestExpenseCategory(expenseCategories: Category[]): Category | null {
  if (expenseCategories.length === 0) {
    return null;
  }

  const general = expenseCategories.find(
    (category) => category.name.trim().toLowerCase() === "general",
  );
  if (general) {
    return general;
  }

  const other = expenseCategories.find(
    (category) => category.name.trim().toLowerCase() === "other",
  );
  if (other) {
    return other;
  }

  return expenseCategories[0];
}

async function scanReceipt(
  file: File,
  expenseCategories: Category[],
): Promise<ScanSuggestion> {
  const response = await scanReceiptApi(file);
  const type = response.type === "income" || response.type === "expense" ? response.type : "expense";
  const fallbackCategory = pickBestExpenseCategory(expenseCategories);

  let date = new Date();
  if (response.transaction_date) {
    const parsed = new Date(response.transaction_date);
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    }
  }

  const note = response.note?.trim() || response.merchant?.trim() || "";
  const suggestedCategoryId = resolveSuggestedCategoryId(response, expenseCategories);
  return {
    amount: Number.isFinite(response.amount) ? Number(response.amount) : null,
    categoryId: suggestedCategoryId ?? (fallbackCategory ? String(fallbackCategory.id) : ""),
    date,
    note,
    type,
    confidence:
      typeof response.confidence === "number" && Number.isFinite(response.confidence)
        ? response.confidence
        : null,
  };
}

function resolveSuggestedCategoryId(
  response: ReceiptScanSuggestion,
  expenseCategories: Category[],
): string | null {
  const suggestedId = response.category_suggestion?.id;
  if (typeof suggestedId === "number") {
    const exists = expenseCategories.some((category) => category.id === suggestedId);
    if (exists) {
      return String(suggestedId);
    }
  }

  const fallbackCategory = pickBestExpenseCategory(expenseCategories);
  return fallbackCategory ? String(fallbackCategory.id) : null;
}

function toConfidenceLabel(confidence: number): "Low" | "Medium" | "High" {
  if (confidence < 0.4) {
    return "Low";
  }
  if (confidence <= 0.7) {
    return "Medium";
  }
  return "High";
}
