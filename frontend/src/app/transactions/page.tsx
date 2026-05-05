"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, List, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { AddTransactionModal } from "@/features/transactions/components/AddTransactionModal";
import { DeleteTransactionConfirmModal } from "@/features/transactions/components/DeleteTransactionConfirmModal";
import { EditTransactionModal } from "@/features/transactions/components/EditTransactionModal";
import { TransactionFilters } from "@/features/transactions/components/TransactionFilters";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { TransactionLoadingState } from "@/features/transactions/components/TransactionLoadingState";
import { getCategories } from "@/features/categories/api";
import { deleteTransaction, getTransactions } from "@/features/transactions/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getToken } from "@/lib/api/client";
import { DashboardBackground } from "@/features/dashboard/components/DashboardBackground";
import { logout } from "@/lib/auth";
import type { Category, CategoryType } from "@/types/category.types";
import type { Transaction } from "@/types/transaction.types";

type TransactionsState = {
  transactions: Transaction[];
  categories: Category[];
};

function isAuthError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("unauthorized") ||
    normalized.includes("invalid token") ||
    normalized.includes("token expired") ||
    normalized.includes("401") ||
    normalized.includes("403")
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const [state, setState] = useState<TransactionsState | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState<CategoryType | "all">("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [deleteTransactionError, setDeleteTransactionError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [txData, categories] = await Promise.all([
        getTransactions({
          limit: 200,
          offset: 0,
        }),
        getCategories(),
      ]);
      setState({
        categories,
        transactions: sortByNewest(txData.items),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load transactions.";
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
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadData, router]);

  const categoriesMap = useMemo(
    () => new Map(state?.categories.map((category) => [category.id, category]) ?? []),
    [state?.categories],
  );

  const visibleTransactions = useMemo(() => {
    const transactions = state?.transactions ?? [];
    const query = debouncedSearch.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (type !== "all" && transaction.type !== type) {
        return false;
      }

      if (!query) {
        return true;
      }

      const categoryName =
        transaction.category?.name ??
        categoriesMap.get(transaction.category_id)?.name ??
        "";
      const note = transaction.note ?? "";

      return (
        note.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      );
    });
  }, [categoriesMap, debouncedSearch, state?.transactions, type]);

  const totalTransactionsCount = state?.transactions.length ?? 0;
  const visibleTransactionsCount = visibleTransactions.length;
  const hasActiveFilter = type !== "all" || debouncedSearch.trim().length > 0;
  const resultLabel =
    visibleTransactionsCount === 0
      ? "No transactions found"
      : `${visibleTransactionsCount} transaction${visibleTransactionsCount > 1 ? "s" : ""} found`;

  async function handleDeleteTransaction() {
    if (!deletingTransaction) {
      return;
    }

    setDeleteTransactionError("");
    setIsDeletingTransaction(true);
    try {
      await deleteTransaction(deletingTransaction.id);
      setState((current) =>
        current
          ? {
              ...current,
              transactions: current.transactions.filter(
                (item) => item.id !== deletingTransaction.id,
              ),
            }
          : current,
      );
      setDeletingTransaction(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete transaction.";
      if (isAuthError(message)) {
        logout();
        router.replace("/login");
        return;
      }
      setDeleteTransactionError(message);
    } finally {
      setIsDeletingTransaction(false);
    }
  }

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
                <List className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="page-label">
                  Transactions
                </p>
                <h1 className="page-title mt-3">
                  Transactions
                </h1>
                <p className="page-subtitle mt-3 max-w-2xl">
                  Manage all transactions from one place.
                </p>
              </div>
            </div>
          </div>

          <button
            className="btn-base btn-primary w-full sm:w-auto"
            onClick={() => setIsAddTransactionOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </motion.header>

        {error ? (
          <motion.div
            className="alert-error mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        ) : null}

        <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
          <TransactionFilters
            onSearchChange={setSearch}
            onTypeChange={setType}
            search={search}
            type={type}
          />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{resultLabel}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {isLoading ? (
            <TransactionLoadingState />
          ) : (
            <TransactionList
              categories={categoriesMap}
              emptyDescription={
                totalTransactionsCount === 0
                  ? "Add your first transaction to start tracking."
                  : "Try changing your search or filter."
              }
              emptyTitle={
                totalTransactionsCount === 0 && !hasActiveFilter
                  ? "No transactions yet"
                  : "No matching transactions"
              }
              onDelete={(transaction) => {
                setDeleteTransactionError("");
                setDeletingTransaction(transaction);
              }}
              onEdit={setEditingTransaction}
              transactions={visibleTransactions}
            />
          )}
        </motion.div>
      </div>

      {isAddTransactionOpen ? (
        <AddTransactionModal
          onClose={() => setIsAddTransactionOpen(false)}
          onCreated={(transaction) => {
            setState((current) =>
              current
                ? {
                    ...current,
                    transactions: sortByNewest([transaction, ...current.transactions]),
                  }
                : current,
            );
            setIsAddTransactionOpen(false);
          }}
        />
      ) : null}

      {editingTransaction ? (
        <EditTransactionModal
          onClose={() => setEditingTransaction(null)}
          onUpdated={(updatedTransaction) => {
            setState((current) =>
              current
                ? {
                    ...current,
                    transactions: sortByNewest(
                      current.transactions.map((item) =>
                        item.id === updatedTransaction.id
                          ? { ...item, ...updatedTransaction }
                          : item,
                      ),
                    ),
                  }
                : current,
            );
            setEditingTransaction(null);
          }}
          transaction={editingTransaction}
        />
      ) : null}

      {deletingTransaction ? (
        <DeleteTransactionConfirmModal
          error={deleteTransactionError}
          isDeleting={isDeletingTransaction}
          onClose={() => {
            if (!isDeletingTransaction) {
              setDeletingTransaction(null);
              setDeleteTransactionError("");
            }
          }}
          onConfirm={handleDeleteTransaction}
          transaction={deletingTransaction}
        />
      ) : null}
    </main>
  );
}

function sortByNewest(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
  );
}
