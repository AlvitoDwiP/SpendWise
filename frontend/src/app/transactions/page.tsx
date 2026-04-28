"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

import { TransactionFilters } from "../../components/transactions/TransactionFilters";
import { TransactionList } from "../../components/transactions/TransactionList";
import { TransactionPagination } from "../../components/transactions/TransactionPagination";
import {
  TransactionLoadingState,
  TransactionPaginationLoadingState,
} from "../../components/transactions/LoadingState";
import {
  getTransactions,
  getCategories,
  deleteTransaction,
  getToken,
  type Transaction,
  type Category,
  type CategoryType,
} from "../../lib/api";
import { logout } from "../../lib/auth";

interface TransactionsState {
  transactions: Transaction[];
  categories: Category[];
  limit: number;
  offset: number;
  total: number;
}

function isAuthError(message: string): boolean {
  return (
    message.includes("Unauthorized") ||
    message.includes("Invalid token") ||
    message.includes("Token expired")
  );
}

export default function TransactionsPage() {
  const router = useRouter();

  // Filter states
  const [type, setType] = useState<CategoryType | "all">("all");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data states
  const [state, setState] = useState<TransactionsState | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Create categories map for quick lookup
  const categoriesMap = new Map(
    state?.categories.map((c) => [c.id, c]) || []
  );

  // Load transactions and categories
  const loadData = useCallback(
    async (newOffset = 0) => {
      setIsLoading(true);
      setError("");

      try {
        const typeParam =
          type === "all"
            ? undefined
            : (type as CategoryType);

        const [txData, cats] = await Promise.all([
          getTransactions({
            limit: 20,
            offset: newOffset,
            type: typeParam,
            category_id:
              categoryId === "" ? undefined : categoryId,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          }),
          getCategories(),
        ]);

        setState({
          transactions: txData.items,
          categories: cats,
          limit: txData.pagination.limit,
          offset: txData.pagination.offset,
          total: txData.pagination.total,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load transactions.";

        if (isAuthError(message)) {
          logout();
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [type, categoryId, startDate, endDate, router]
  );

  // Check auth and load initial data
  useEffect(() => {
    let isMounted = true;

    async function initializeData() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      if (isMounted) {
        await loadData(0);
      }
    }

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [router, loadData]);

  // Handle filter changes
  const handleFilterChange = useCallback(() => {
    loadData(0);
  }, [loadData]);

  const handleReset = useCallback(() => {
    setType("all");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
  }, []);

  // Handle delete
  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Are you sure you want to delete this transaction?")) {
        return;
      }

      try {
        await deleteTransaction(id);
        // Refetch data
        if (state) {
          loadData(state.offset);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete transaction.";

        if (isAuthError(message)) {
          logout();
          router.replace("/login");
          return;
        }

        setError(message);
      }
    },
    [state, loadData, router]
  );

  // Handle pagination
  const handlePreviousClick = useCallback(() => {
    if (state && state.offset > 0) {
      loadData(state.offset - state.limit);
    }
  }, [state, loadData]);

  const handleNextClick = useCallback(() => {
    if (state && state.offset + state.limit < state.total) {
      loadData(state.offset + state.limit);
    }
  }, [state, loadData]);

  return (
    <div className="min-h-screen bg-[#0f0f10]">
      {/* Mesh glow background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
        <div className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-blue-600/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 h-80 w-80 rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      {/* Container */}
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <p className="mt-1 text-slate-400">
              Track and manage your spending history.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            disabled
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 font-medium text-white opacity-50 cursor-not-allowed"
          >
            <Plus size={20} />
            Add Transaction
          </motion.button>
        </div>

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-8"
        >
          <TransactionFilters
            type={type}
            categoryId={categoryId}
            startDate={startDate}
            endDate={endDate}
            categories={state?.categories || []}
            onTypeChange={(newType) => {
              setType(newType);
              handleFilterChange();
            }}
            onCategoryChange={(newCategoryId) => {
              setCategoryId(newCategoryId);
              handleFilterChange();
            }}
            onStartDateChange={(newStartDate) => {
              setStartDate(newStartDate);
              handleFilterChange();
            }}
            onEndDateChange={(newEndDate) => {
              setEndDate(newEndDate);
              handleFilterChange();
            }}
            onReset={() => {
              handleReset();
              // Need to refetch after reset
              setTimeout(handleFilterChange, 0);
            }}
          />
        </motion.div>

        {/* List or Loading */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {isLoading ? (
            <TransactionLoadingState />
          ) : (
            <TransactionList
              transactions={state?.transactions || []}
              categories={categoriesMap}
              onDelete={handleDelete}
            />
          )}
        </motion.div>

        {/* Pagination */}
        {state && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="mt-8"
          >
            {isLoading ? (
              <TransactionPaginationLoadingState />
            ) : (
              <TransactionPagination
                limit={state.limit}
                offset={state.offset}
                total={state.total}
                onPreviousClick={handlePreviousClick}
                onNextClick={handleNextClick}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
