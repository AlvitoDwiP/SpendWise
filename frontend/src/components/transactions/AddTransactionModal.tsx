"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Receipt, X } from "lucide-react";

import {
  createTransaction,
  getCategories,
  type Category,
  type CategoryType,
  type Transaction,
  type TransactionPayload,
} from "../../lib/api";
import {
  TransactionForm,
  type TransactionField,
  type TransactionFormValues,
} from "./TransactionForm";
import { isValidDate, parseTransactionDate, toRFC3339 } from "./dateUtils";
import { ReceiptUploadStep } from "./ReceiptUploadStep";

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
  confidence?: number;
  warning?: string;
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
        date: parseTransactionDate(suggestion.date) ?? new Date(),
        note: suggestion.note,
        type: suggestion.type,
      }));
      setMode("manual");
      setScanSuggestionNotice(
        suggestion.warning ??
          "Receipt uploaded. OCR backend belum tersedia. Isi nominal secara manual sebelum menyimpan.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare suggestion.");
    } finally {
      setIsScanning(false);
    }
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
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => {
          if (!isSubmitting && !isScanning) {
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
            <p className="text-lg font-semibold">Add Transaction</p>
            <p className="mt-1 text-sm leading-6 text-white/55">
              Add manually or use receipt-assisted input before saving.
            </p>
          </div>
          <button
            aria-label="Close modal"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting || isScanning}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
          <button
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "manual"
                ? "bg-purple-500/20 text-purple-200"
                : "text-white/70 hover:bg-white/10"
            }`}
            disabled={isSubmitting || isScanning}
            onClick={() => setMode("manual")}
            type="button"
          >
            Manual
          </button>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              mode === "scan"
                ? "bg-purple-500/20 text-purple-200"
                : "text-white/70 hover:bg-white/10"
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
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {categoriesError}
          </p>
        ) : null}

        {scanSuggestionNotice ? (
          <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {scanSuggestionNotice}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
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
            <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              Amount harus diisi lebih dari 0 sebelum disimpan.
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || isScanning}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (file.name.toLowerCase().includes("fail")) {
    throw new Error("Receipt upload failed. Please try another image.");
  }

  const preferredCategory = pickBestExpenseCategory(expenseCategories);

  // TODO: Replace with OCR backend call when endpoint is available.
  return {
    amount: null,
    categoryId: preferredCategory ? String(preferredCategory.id) : "",
    date: parseTransactionDate(new Date().toISOString().slice(0, 10)) ?? new Date(),
    note: "",
    type: "expense",
    confidence: 0,
    warning: preferredCategory
      ? "Receipt uploaded. OCR backend belum tersedia. Isi nominal secara manual sebelum menyimpan."
      : "Receipt uploaded. OCR backend belum tersedia dan category expense belum ada. Pilih category secara manual.",
  };
}
