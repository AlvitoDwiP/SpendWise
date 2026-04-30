"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

import { AddTransactionModal } from "../../components/transactions/AddTransactionModal";
import { DeleteTransactionConfirmModal } from "../../components/transactions/DeleteTransactionConfirmModal";
import { EditTransactionModal } from "../../components/transactions/EditTransactionModal";
import { TransactionFilters } from "../../components/transactions/TransactionFilters";
import { TransactionList } from "../../components/transactions/TransactionList";
import { TransactionLoadingState } from "../../components/transactions/LoadingState";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  deleteTransaction,
  getCategories,
  getToken,
  getTransactions,
  type Category,
  type CategoryType,
  type Transaction,
} from "../../lib/api";
import { logout } from "../../lib/auth";

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
    <div className="min-h-screen bg-[#0f0f10]">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
        <div className="absolute left-1/4 top-1/2 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="mt-1 text-slate-400">
              Manage all transactions from one place.
            </p>
          </motion.div>

          <motion.button
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 px-4 py-2 font-medium text-white"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsAddTransactionOpen(true)}
            transition={{ duration: 0.3, delay: 0.1 }}
            type="button"
          >
            <Plus size={20} />
            Add Transaction
          </motion.button>
        </div>

        {error ? (
          <motion.div
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
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
          <p className="mt-3 text-sm text-slate-400">{resultLabel}</p>
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
    </div>
  );
}

function sortByNewest(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) =>
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
  );
}
