"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

import { deleteCategory, type Category } from "../../lib/api";

type DeleteCategoryConfirmModalProps = {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (categoryId: number) => void;
};

export function DeleteCategoryConfirmModal({
  category,
  isOpen,
  onClose,
  onDeleted,
}: DeleteCategoryConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setIsSubmitting(true);

    try {
      await deleteCategory(category.id);
      onDeleted(category.id);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end px-4 pb-4 sm:place-items-center sm:p-6">
          <motion.button
            aria-label="Close delete confirmation modal"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isSubmitting) {
                onClose();
              }
            }}
            type="button"
          />

          <motion.section
            aria-modal="true"
            className="relative w-full max-w-md rounded-3xl border border-rose-400/20 bg-[#1c1c1e]/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            role="dialog"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-300">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-semibold">Delete Category</p>
                  <p className="mt-1 text-sm leading-6 text-white/60">
                    Delete <span className="font-semibold text-white">{category?.name}</span>? This action cannot be undone.
                  </p>
                </div>
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

            {error ? (
              <p className="mt-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/20 px-5 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                onClick={handleDelete}
                type="button"
              >
                {isSubmitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
