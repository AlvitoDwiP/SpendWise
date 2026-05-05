"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

import { deleteCategory } from "@/features/categories/api";
import type { Category } from "@/types/category.types";

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
            className="modal-overlay"
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
            className="modal-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            role="dialog"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="modal-handle" />
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[rgba(216,124,124,0.28)] bg-[var(--accent-red-soft)] text-[var(--accent-red)]">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <p className="page-label text-[var(--accent-red)]">Danger Action</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Delete Category</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                    Delete <span className="font-semibold text-white">{category?.name}</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                aria-label="Close modal"
                className="icon-button shrink-0 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error ? (
              <p className="alert-error mt-4">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                className="btn-base btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn-base btn-danger disabled:cursor-not-allowed disabled:opacity-60"
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
