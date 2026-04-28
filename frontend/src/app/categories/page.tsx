"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Folder, Plus } from "lucide-react";

import { AddCategoryPlaceholderModal } from "../../components/categories/AddCategoryPlaceholderModal";
import { CategoryList } from "../../components/categories/CategoryList";
import {
  CategoryEmptyState,
  CategoryErrorState,
  CategoryLoadingState,
} from "../../components/categories/CategoryStates";
import { DashboardBackground } from "../../components/dashboard/DashboardBackground";
import {
  getCategories,
  getToken,
  type Category,
  type CategoryType,
} from "../../lib/api";
import { logout } from "../../lib/auth";

type CategorySummary = Record<CategoryType, number>;

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      const message =
        err instanceof Error ? err.message : "Failed to load categories.";

      if (isAuthError(message)) {
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#0f0f10] px-4 pb-10 pt-5 text-white sm:px-6 lg:px-8">
      <DashboardBackground />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.header
          className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <div className="min-w-0">
            <Link
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/55 transition hover:text-purple-300"
              href="/dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple-500/15 text-purple-300">
                <Folder className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/35">
                  SpendWise
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-normal text-white sm:text-4xl">
                  Categories
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                  Organize income and expenses into clear groups before adding
                  more transaction workflows.
                </p>
              </div>
            </div>
          </div>

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.98] sm:w-auto"
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
          <CategoryList categories={categories} />
        )}
      </div>

      <AddCategoryPlaceholderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
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
      ? "text-emerald-300"
      : tone === "expense"
        ? "text-rose-300"
        : "text-purple-300";

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-bold ${toneClassName}`}>{value}</p>
    </motion.div>
  );
}

function isAuthError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("401") ||
    normalizedMessage.includes("403") ||
    normalizedMessage.includes("authorization") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("token")
  );
}
