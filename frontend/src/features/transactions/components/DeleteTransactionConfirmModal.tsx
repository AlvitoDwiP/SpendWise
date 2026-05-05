"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

import type { Transaction } from "@/types/transaction.types";
import { formatDate, formatRupiah } from "@/lib/format";

type DeleteTransactionConfirmModalProps = {
  error?: string;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction;
};

export function DeleteTransactionConfirmModal({
  error,
  isDeleting = false,
  onClose,
  onConfirm,
  transaction,
}: DeleteTransactionConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end px-4 pb-4 sm:place-items-center sm:p-6">
      <motion.button
        aria-label="Close delete transaction modal"
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => {
          if (!isDeleting) {
            onClose();
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
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[rgba(216,124,124,0.28)] bg-[var(--accent-red-soft)] text-[var(--accent-red)]">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="page-label">Danger Action</p>
              <p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Delete Transaction</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            className="icon-button shrink-0 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="warm-elevated mt-5 p-4 text-sm">
          <p className="field-label mb-1">Amount</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
            {transaction.type === "expense" ? "-" : "+"}
            {formatRupiah(transaction.amount)}
          </p>
          <p className="field-label mb-1 mt-4">Category</p>
          <p className="mt-1 font-medium text-[var(--text-primary)]">
            {transaction.category?.name ?? transaction.type}
          </p>
          <p className="field-label mb-1 mt-4">Date</p>
          <p className="mt-1 font-medium text-[var(--text-primary)]">
            {transaction.transaction_date ? formatDate(transaction.transaction_date) : "-"}
          </p>
        </div>

        {error ? (
          <p className="alert-error mt-4">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="btn-base btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn-base btn-danger disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isDeleting}
            onClick={onConfirm}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.section>
    </div>
  );
}
