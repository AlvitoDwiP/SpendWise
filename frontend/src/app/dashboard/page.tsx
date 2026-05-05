"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronDown, Menu, Plus, TrendingDown, TrendingUp } from "lucide-react";

import { BalanceHeroCard } from "@/features/dashboard/components/BalanceHeroCard";
import { BalanceStatsCards } from "@/features/dashboard/components/BalanceStatsCards";
import { DashboardBackground } from "@/features/dashboard/components/DashboardBackground";
import { DashboardDrawer } from "@/components/layout/DashboardDrawer";
import { DashboardSidebarCard } from "@/components/layout/DashboardSidebarCard";
import { AnimatePresence } from "framer-motion";
import {
  DashboardErrorState,
  DashboardLoadingState,
} from "@/features/dashboard/components/DashboardStates";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { MobileAllTimeBalanceCard } from "@/features/dashboard/components/MobileAllTimeBalanceCard";
import { MobileDashboardHeader } from "@/features/dashboard/components/MobileDashboardHeader";
import { MobileFinancialSummaryCompactCard } from "@/features/dashboard/components/MobileFinancialSummaryCompactCard";
import { MobileMetricCard } from "@/features/dashboard/components/MobileMetricCard";
import { MobileMonthlyTransactionsCard } from "@/features/dashboard/components/MobileMonthlyTransactionsCard";
import { MobileMonthFilter } from "@/features/dashboard/components/MobileMonthFilter";
import { MobileRecentTransactions } from "@/features/dashboard/components/MobileRecentTransactions";
import { RecentTransactionsCard } from "@/features/dashboard/components/RecentTransactionsCard";
import { SpendingOverviewCard } from "@/features/dashboard/components/SpendingOverviewCard";
import { ThisMonthSummaryCard } from "@/features/dashboard/components/ThisMonthSummaryCard";
import { AddTransactionModal } from "@/features/transactions/components/AddTransactionModal";
import { DeleteTransactionConfirmModal } from "@/features/transactions/components/DeleteTransactionConfirmModal";
import { EditTransactionModal } from "@/features/transactions/components/EditTransactionModal";
import { getDashboardSummary, getRecentTransactions } from "@/features/dashboard/api";
import { getMe } from "@/features/settings/api";
import { deleteTransaction, getTransactions } from "@/features/transactions/api";
import { buildUrl, getToken } from "@/lib/api/client";
import {
  type DashboardSummary,
} from "@/types/dashboard.types";
import type { Transaction } from "@/types/transaction.types";
import type { User } from "@/types/user.types";
import { logout } from "@/lib/auth";

type DashboardState = {
  allTransactions: Transaction[];
  user: User;
  summary: DashboardSummary;
  recentTransactions: Transaction[];
};

type MonthOption = {
  key: string;
  label: string;
  month: number;
  year: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [deleteTransactionError, setDeleteTransactionError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonthKey, setSelectedMonthKey] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [user, summary, recentTransactions, allTransactionsResponse] = await Promise.all([
          getMe(),
          getDashboardSummary(),
          getRecentTransactions(),
          getTransactions({ limit: 500, offset: 0 }),
        ]);

        if (isMounted) {
          setDashboard({
            user,
            summary,
            recentTransactions,
            allTransactions: sortByNewest(allTransactionsResponse.items),
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard.";

        if (isAuthError(message)) {
          logout();
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const greeting = useMemo(() => getGreeting(), []);

  const monthOptions = useMemo<MonthOption[]>(() => {
    const formatter = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    });
    const options: MonthOption[] = [];
    const seen = new Set<string>();
    const now = new Date();

    const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    seen.add(nowKey);
    options.push({
      key: nowKey,
      label: formatter.format(new Date(now.getFullYear(), now.getMonth(), 1)),
      month: now.getMonth(),
      year: now.getFullYear(),
    });

    (dashboard?.allTransactions ?? []).forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      options.push({
        key,
        label: formatter.format(new Date(date.getFullYear(), date.getMonth(), 1)),
        month: date.getMonth(),
        year: date.getFullYear(),
      });
    });

    return options.sort((a, b) => (a.key > b.key ? -1 : 1));
  }, [dashboard?.allTransactions]);

  const effectiveSelectedMonthKey = selectedMonthKey || monthOptions[0]?.key || "";
  const selectedMonth = useMemo(
    () => monthOptions.find((option) => option.key === effectiveSelectedMonthKey) ?? null,
    [effectiveSelectedMonthKey, monthOptions],
  );

  const monthTransactions = useMemo(() => {
    if (!selectedMonth) {
      return [] as Transaction[];
    }

    return (dashboard?.allTransactions ?? []).filter((transaction) => {
      const date = new Date(transaction.transaction_date);
      return (
        date.getFullYear() === selectedMonth.year &&
        date.getMonth() === selectedMonth.month
      );
    });
  }, [dashboard?.allTransactions, selectedMonth]);

  const kpi = useMemo(() => {
    return monthTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        acc.transactions += 1;
        return acc;
      },
      { income: 0, expense: 0, transactions: 0 },
    );
  }, [monthTransactions]);

  const rollingExpense = useMemo(() => {
    const all = dashboard?.allTransactions ?? [];
    const now = new Date();
    const start7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
    const start28 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27, 0, 0, 0, 0);

    let last7Days = 0;
    let last28Days = 0;
    let allTimeExpense = 0;

    all.forEach((transaction) => {
      if (transaction.type !== "expense") {
        return;
      }

      const date = new Date(transaction.transaction_date);
      allTimeExpense += transaction.amount;
      if (date >= start28) {
        last28Days += transaction.amount;
      }
      if (date >= start7) {
        last7Days += transaction.amount;
      }
    });

    return {
      allTimeExpense,
      last28Days,
      last7Days,
    };
  }, [dashboard?.allTransactions]);

  const incomeBars = useMemo(
    () => buildMiniBars(monthTransactions, "income"),
    [monthTransactions],
  );
  const expenseBars = useMemo(
    () => buildMiniBars(monthTransactions, "expense"),
    [monthTransactions],
  );
  async function refreshDashboardState() {
    try {
      const [summary, recentTransactions, allTransactionsResponse] = await Promise.all([
        getDashboardSummary(),
        getRecentTransactions(),
        getTransactions({ limit: 500, offset: 0 }),
      ]);
      setDashboard((current) =>
        current
          ? {
              ...current,
              recentTransactions,
              summary,
              allTransactions: sortByNewest(allTransactionsResponse.items),
            }
          : current,
      );
    } catch {
      // Keep optimistic state if refresh fails.
    }
  }

  async function handleDeleteTransaction() {
    if (!deletingTransaction) {
      return;
    }

    setDeleteTransactionError("");
    setIsDeletingTransaction(true);

    try {
      await deleteTransaction(deletingTransaction.id);
      setDashboard((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          recentTransactions: current.recentTransactions.filter(
            (item) => item.id !== deletingTransaction.id,
          ),
          allTransactions: current.allTransactions.filter(
            (item) => item.id !== deletingTransaction.id,
          ),
        };
      });
      setDeletingTransaction(null);
      await refreshDashboardState();
    } catch (err) {
      setDeleteTransactionError(
        err instanceof Error ? err.message : "Failed to delete transaction.",
      );
    } finally {
      setIsDeletingTransaction(false);
    }
  }

  function handleLogout() {
    logout();
    setIsDrawerOpen(false);
    router.replace("/login");
  }

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (error || !dashboard || !selectedMonth) {
    return (
      <DashboardErrorState
        message={error || "Unable to load dashboard data."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const { recentTransactions, summary, user } = dashboard;
  const resolvedProfilePhotoUrl = user.profile_photo_url
    ? buildUrl(user.profile_photo_url)
    : null;

  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[var(--background)] text-[var(--text-primary)]">
      <DashboardBackground />

      <motion.div
        className="relative flex min-h-screen"
        layout
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
              className="hidden md:block md:pb-12 md:pl-8 md:pt-0"
            >
              <DashboardSidebarCard onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative mx-auto w-full max-w-[430px] flex-1 px-0 pb-[calc(env(safe-area-inset-bottom)+7.5rem)] pt-0 md:max-w-full md:px-8 md:pb-12 md:pt-0">
          <div className="space-y-5 pb-2 md:hidden">
            <MobileDashboardHeader
              greeting={greeting}
              profilePhotoUrl={resolvedProfilePhotoUrl}
              userName={user.name}
            />
            <section className="px-7 pt-6">
              <MobileMonthFilter
                monthOptions={monthOptions}
                onMonthChange={setSelectedMonthKey}
                selectedMonthKey={effectiveSelectedMonthKey}
              />
            </section>
            <MobileAllTimeBalanceCard balance={summary.current_balance} />
            <section className="grid grid-cols-2 gap-4 px-7">
              <MobileMetricCard
                accentClassName="bg-[var(--accent-green-soft)] text-[var(--accent-green)]"
                amountClassName="text-[var(--accent-green)]"
                bars={incomeBars}
                borderClassName="border-[rgba(95,197,142,0.24)]"
                icon={TrendingUp}
                label="Income"
                sublabel="This Month"
                value={kpi.income}
              />
              <MobileMetricCard
                accentClassName="bg-[var(--accent-red-soft)] text-[var(--accent-red)]"
                amountClassName="text-[var(--accent-red)]"
                bars={expenseBars}
                borderClassName="border-[rgba(216,124,124,0.24)]"
                icon={TrendingDown}
                label="Expense"
                sublabel="This Month"
                value={kpi.expense}
              />
            </section>
            <section className="grid grid-cols-2 gap-4 px-7">
              <MobileFinancialSummaryCompactCard expense={kpi.expense} income={kpi.income} />
              <MobileMonthlyTransactionsCard
                monthLabel={selectedMonth.label}
                transactionCount={kpi.transactions}
              />
            </section>
            <MobileRecentTransactions
              onDeleteTransaction={(transaction) => {
                setDeleteTransactionError("");
                setDeletingTransaction(transaction);
              }}
              onEditTransaction={(transaction) => setEditingTransaction(transaction)}
              transactions={recentTransactions}
            />
          </div>

          <motion.div
            className="hidden min-w-0 gap-4 md:mt-6 md:grid md:gap-7 lg:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.78fr)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            layout
          >
            <div className="hidden min-w-0 space-y-4 md:block md:space-y-6">
              <div className="md:flex md:items-start md:gap-3">
                <motion.button
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white shadow-xl shadow-black/20 backdrop-blur-md transition hover:bg-white/10"
                  onClick={() => setIsSidebarOpen((value) => !value)}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.button>
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white">
                      {resolvedProfilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={`${user.name} profile`}
                          className="h-full w-full object-cover"
                          src={resolvedProfilePhotoUrl}
                        />
                      ) : (
                        getInitial(user.name)
                      )}
                    </div>
                    <h1 className="truncate text-2xl font-semibold text-white">
                      {greeting}, {user.name}
                    </h1>
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-white/60">
                    Take full control of your financial future starting today.
                  </p>
                </div>
              </div>
              <BalanceHeroCard
                balance={summary.current_balance}
                greeting={greeting}
                profilePhotoUrl={resolvedProfilePhotoUrl}
                userName={user.name}
              />
              <BalanceStatsCards
                expense={kpi.expense}
                income={kpi.income}
                monthLabel={selectedMonth.label}
                transactionCount={kpi.transactions}
              />
              <SpendingOverviewCard
                activeMonthKey={selectedMonth.key}
                transactions={dashboard.allTransactions}
              />
            </div>

            <div className="hidden min-w-0 space-y-5 md:block">
              <section className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="relative min-w-0 flex-1">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <select
                      className="h-[42px] w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-9 pr-9 text-sm font-medium text-white/80 outline-none backdrop-blur-md transition hover:bg-white/10 focus:border-purple-400/40"
                      onChange={(event) => setSelectedMonthKey(event.target.value)}
                      value={effectiveSelectedMonthKey}
                    >
                      {monthOptions.map((option) => (
                        <option className="bg-[#1c1c1e] text-white" key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    className="flex h-[42px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/20"
                    onClick={() => setIsAddTransactionOpen(true)}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </motion.button>
                </div>
              </section>
              <ThisMonthSummaryCard
                activeMonthExpense={kpi.expense}
                compact
                net={kpi.income - kpi.expense}
                totalExpenseAllTime={rollingExpense.allTimeExpense}
                totalExpenseLast28Days={rollingExpense.last28Days}
                totalExpenseLast7Days={rollingExpense.last7Days}
              />
              <RecentTransactionsCard
                onDeleteTransaction={(transaction) => {
                  setDeleteTransactionError("");
                  setDeletingTransaction(transaction);
                }}
                onEditTransaction={(transaction) => setEditingTransaction(transaction)}
                transactions={recentTransactions}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <MobileBottomNav
        onAddTransaction={() => setIsAddTransactionOpen(true)}
        onLogout={handleLogout}
      />
      <DashboardDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
      />
      {isAddTransactionOpen ? (
        <AddTransactionModal
          onClose={() => setIsAddTransactionOpen(false)}
          onCreated={(createdTransaction) => {
            setDashboard((current) => {
              if (!current) {
                return current;
              }

              return {
                ...current,
                recentTransactions: [createdTransaction, ...current.recentTransactions].slice(0, 8),
                allTransactions: sortByNewest([createdTransaction, ...current.allTransactions]),
              };
            });
            refreshDashboardState();
          }}
        />
      ) : null}
      {editingTransaction ? (
        <EditTransactionModal
          onClose={() => setEditingTransaction(null)}
          onUpdated={(updatedTransaction) => {
            setDashboard((current) => {
              if (!current) {
                return current;
              }
              return {
                ...current,
                recentTransactions: sortByNewest(
                  current.recentTransactions.map((item) =>
                    item.id === updatedTransaction.id ? { ...item, ...updatedTransaction } : item,
                  ),
                ),
                allTransactions: sortByNewest(
                  current.allTransactions.map((item) =>
                    item.id === updatedTransaction.id ? { ...item, ...updatedTransaction } : item,
                  ),
                ),
              };
            });
            setEditingTransaction(null);
            refreshDashboardState();
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
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime(),
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }
  if (hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
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

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}

function buildMiniBars(
  transactions: Transaction[],
  type: "income" | "expense",
): number[] {
  const groups = Array.from({ length: 6 }, () => 0);

  transactions
    .filter((transaction) => transaction.type === type)
    .forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      const day = date.getDate();
      const bucket = Math.min(Math.floor((Math.max(day, 1) - 1) / 5), groups.length - 1);
      groups[bucket] += transaction.amount;
    });

  return groups.every((value) => value === 0) ? [0, 0, 0, 0, 0, 0] : groups;
}
