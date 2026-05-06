"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Folder, Plus } from "lucide-react";

import { AddCategoryModal } from "@/features/categories/components/AddCategoryModal";
import { DeleteCategoryConfirmModal } from "@/features/categories/components/DeleteCategoryConfirmModal";
import { EditCategoryModal } from "@/features/categories/components/EditCategoryModal";
import { CategoryList } from "@/features/categories/components/CategoryList";
import {
  CategoryEmptyState,
  CategoryErrorState,
  CategoryLoadingState,
} from "@/features/categories/components/CategoryStates";
import { getCategories } from "@/features/categories/api";
import { getToken } from "@/lib/api/client";
import { DashboardBackground } from "@/features/dashboard/components/DashboardBackground";
import { getErrorMessage, isUnauthorizedError, logout } from "@/lib/auth";
import type { Category, CategoryType } from "@/types/category.types";

type CategorySummary = Record<CategoryType, number>;

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const summary = useMemo(
    () =>
      categories.reduce<CategorySummary>(
        (current, category) => ({
          ...current,
          [category.type]: current[category.type] + 1,
        }),
        { income: 0, expense: 0 },
      ),
    [categories],
  );

  const loadCategories = useCallback(async () => {
    await Promise.resolve();

    if (!getToken()) {
      router.replace("/login");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setCategories(await getCategories());
    } catch (err) {
      const message = getErrorMessage(err, "Failed to load categories.");

      if (isUnauthorizedError(err)) {
        logout();
        router.replace("/login");
        return;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadCategories]);

  return (
    <main className="app-shell px-4 sm:px-6 lg:px-8">
      <DashboardBackground />

      <div className="app-desktop-page relative flex flex-col gap-6">
        <motion.header
          className="warm-panel app-card-pad flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <div className="min-w-0">
            <Link
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent-cream)]"
              href="/dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[var(--border-muted)] bg-[var(--accent-purple-soft)] text-[var(--accent-purple)]">
                <Folder className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="page-label">
                  Category
                </p>
                <h1 className="page-title mt-3">
                  Categories
                </h1>
                <p className="page-subtitle mt-3 max-w-2xl">
                  Organize income and expenses into clear groups before adding
                  more transaction workflows.
                </p>
              </div>
            </div>
          </div>

          <button
            className="btn-base btn-primary w-full sm:w-auto"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </motion.header>

        <section className="grid gap-3 sm:grid-cols-3">
          <CategoryStatCard label="Total" value={categories.length} />
          <CategoryStatCard
            label="Income"
            tone="income"
            value={summary.income}
          />
          <CategoryStatCard
            label="Expense"
            tone="expense"
            value={summary.expense}
          />
        </section>

        {error ? (
          <CategoryErrorState message={error} onRetry={loadCategories} />
        ) : isLoading ? (
          <CategoryLoadingState />
        ) : categories.length === 0 ? (
          <CategoryEmptyState onAddClick={() => setIsAddModalOpen(true)} />
        ) : (
          <CategoryList
            categories={categories}
            onDeleteClick={(category) => {
              setSelectedCategory(category);
              setIsDeleteModalOpen(true);
            }}
            onEditClick={(category) => {
              setSelectedCategory(category);
              setIsEditModalOpen(true);
            }}
          />
        )}
      </div>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(createdCategory) => {
          setCategories((current) => [createdCategory, ...current]);
        }}
      />

      {isEditModalOpen && selectedCategory ? (
        <EditCategoryModal
          category={selectedCategory}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onUpdated={(updatedCategory) => {
            setCategories((current) =>
              current.map((category) =>
                category.id === updatedCategory.id ? updatedCategory : category,
              ),
            );
            setSelectedCategory(null);
          }}
        />
      ) : null}

      {isDeleteModalOpen && selectedCategory ? (
        <DeleteCategoryConfirmModal
          category={selectedCategory}
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          onDeleted={(deletedCategoryId) => {
            setCategories((current) =>
              current.filter((category) => category.id !== deletedCategoryId),
            );
            setSelectedCategory(null);
          }}
        />
      ) : null}
    </main>
  );
}

function CategoryStatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | CategoryType;
}) {
  const toneClassName =
    tone === "income"
      ? "text-[var(--accent-green)]"
      : tone === "expense"
        ? "text-[var(--accent-red)]"
        : "text-[var(--accent-cream)]";

  return (
    <motion.div
      className="warm-panel-compact p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <p className="page-label text-[12px]">
        {label}
      </p>
      <p className={`mt-3 text-[34px] font-semibold tracking-[-0.04em] ${toneClassName}`} style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
    </motion.div>
  );
}
