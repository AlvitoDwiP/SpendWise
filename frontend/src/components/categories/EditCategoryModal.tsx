"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import {
  type Category,
  type CategoryPayload,
  type CategoryType,
  updateCategory,
} from "../../lib/api";
import { getCategoryDefaults } from "../../lib/category-defaults";
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
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
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
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-[#1c1c1e]/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            role="dialog"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Edit Category</p>
                <p className="mt-1 text-sm leading-6 text-white/55">
                  Update category name or type. Icon and color are set
                  automatically.
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

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <CategoryForm
                disabled={isSubmitting}
                name={name}
                onNameChange={setName}
                onTypeChange={setType}
                type={type}
              />

              {error ? (
                <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {error}
                </p>
              ) : null}

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
