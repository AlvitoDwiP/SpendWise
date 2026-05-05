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
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
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
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1c1c1e]/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6"
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        role="dialog"
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-500/15 text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold">Delete Transaction</p>
              <p className="mt-1 text-sm text-white/55">This action cannot be undone.</p>
            </div>
          </div>
          <button
            aria-label="Close modal"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          <p className="text-white/70">Amount</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {transaction.type === "expense" ? "-" : "+"}
            {formatRupiah(transaction.amount)}
          </p>
          <p className="mt-3 text-white/70">Category</p>
          <p className="mt-1 font-medium text-white">
            {transaction.category?.name ?? transaction.type}
          </p>
          <p className="mt-3 text-white/70">Date</p>
          <p className="mt-1 font-medium text-white">
            {transaction.transaction_date ? formatDate(transaction.transaction_date) : "-"}
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDeleting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
