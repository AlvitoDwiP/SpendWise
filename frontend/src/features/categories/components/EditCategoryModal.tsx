"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import {
  updateCategory,
} from "@/features/categories/api";
import { getCategoryDefaults } from "@/lib/category-defaults";
import type { Category, CategoryPayload, CategoryType } from "@/types/category.types";
import { CategoryForm } from "./CategoryForm";

type EditCategoryModalProps = {
  category: Category;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (category: Category) => void;
};

export function EditCategoryModal({
  category,
  isOpen,
  onClose,
  onUpdated,
}: EditCategoryModalProps) {
  const [name, setName] = useState(category.name);
  const [type, setType] = useState<CategoryType | "">(category.type);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    if (!type) {
      setError("Category type is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const defaults = getCategoryDefaults(trimmedName, type);
    const payload: CategoryPayload = {
      name: trimmedName,
      type,
      color: defaults.color,
      icon: defaults.icon,
    };

    try {
      const updatedCategory = await updateCategory(category.id, payload);
      onUpdated(updatedCategory);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update category.",
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
            aria-label="Close edit category modal"
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
              <div>
                <p className="page-label">Category</p>
                <p className="mt-3 text-[30px] leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>
                  Edit Category
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Update category name or type. Icon and color are set
                  automatically.
                </p>
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

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <CategoryForm
                disabled={isSubmitting}
                name={name}
                onNameChange={setName}
                onTypeChange={setType}
                type={type}
              />

              {error ? (
                <p className="alert-error">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  className="btn-base btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn-base btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
