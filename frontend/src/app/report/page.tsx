"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DashboardBackground } from "../../components/dashboard/DashboardBackground";
import { DashboardDrawer } from "../../components/dashboard/DashboardDrawer";
import { DashboardNavbar } from "../../components/dashboard/DashboardNavbar";
import { DashboardSidebarCard } from "../../components/dashboard/DashboardSidebarCard";
import { MobileBottomNav } from "../../components/dashboard/MobileBottomNav";
import {
  type Category,
  getCategories,
  getMe,
  getToken,
  getTransactions,
  type Transaction,
  type User,
} from "../../lib/api";
import { logout } from "../../lib/auth";
import { ReportCategoryBreakdown } from "../../components/report/ReportCategoryBreakdown";
import { ReportPeriodFilter, type ReportPeriod } from "../../components/report/ReportPeriodFilter";
import { ReportSummaryCards } from "../../components/report/ReportSummaryCards";
import {
  ReportEmptyState,
  ReportErrorState,
  ReportLoadingState,
} from "../../components/report/ReportStates";
import { ReportTransactionTrend } from "../../components/report/ReportTransactionTrend";

type ReportData = {
  user: User;
  transactions: Transaction[];
  categories: Category[];
};

const MONTH_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "short",
});

export default function ReportPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("this_month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [user, transactionsResponse, categories] = await Promise.all([
          getMe(),
          getTransactions({ limit: 500, offset: 0 }),
          getCategories(),
        ]);

        if (!isMounted) {
          return;
        }

        setData({
          user,
          categories,
          transactions: transactionsResponse.items,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load report.";

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

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const categoryMap = useMemo(
    () => new Map(data?.categories.map((category) => [category.id, category]) ?? []),
    [data?.categories],
  );

  const filteredTransactions = useMemo(() => {
    const transactions = data?.transactions ?? [];
    const { start, end } = getPeriodRange(period);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      if (Number.isNaN(transactionDate.getTime())) {
        return false;
      }

      if (start && transactionDate < start) {
        return false;
      }

      if (end && transactionDate > end) {
        return false;
      }

      return true;
    });
  }, [data?.transactions, period]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }

        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [filteredTransactions]);

  const categoryBreakdown = useMemo(() => {
    const totalExpense = summary.expense;
    const grouped = new Map<string, { name: string; total: number }>();

    filteredTransactions.forEach((transaction) => {
      if (transaction.type !== "expense") {
        return;
      }

      const categoryName =
        transaction.category?.name ??
        categoryMap.get(transaction.category_id)?.name ??
        "Uncategorized";
      const key = categoryName.toLowerCase();
      const current = grouped.get(key);

      if (!current) {
        grouped.set(key, { name: categoryName, total: transaction.amount });
        return;
      }

      current.total += transaction.amount;
    });

    return Array.from(grouped.entries())
      .map(([key, value]) => ({
        key,
        name: value.name,
        total: value.total,
        percentage: totalExpense === 0 ? 0 : (value.total / totalExpense) * 100,
      }))
      .sort((a, b) => b.total - a.total);
  }, [categoryMap, filteredTransactions, summary.expense]);

  const trendItems = useMemo(() => {
    const grouped = new Map<string, { label: string; expense: number; order: number }>();
    const useDaily = period === "this_month" || period === "last_month";

    filteredTransactions.forEach((transaction) => {
      if (transaction.type !== "expense") {
        return;
      }

      const date = new Date(transaction.transaction_date);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = useDaily
        ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        : `${date.getFullYear()}-${date.getMonth() + 1}`;
      const label = useDaily
        ? String(date.getDate()).padStart(2, "0")
        : `${MONTH_FORMATTER.format(date)} ${String(date.getFullYear()).slice(-2)}`;
      const order = useDaily
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
        : new Date(date.getFullYear(), date.getMonth(), 1).getTime();

      const current = grouped.get(key);
      if (!current) {
        grouped.set(key, { label, expense: transaction.amount, order });
        return;
      }

      current.expense += transaction.amount;
    });

    return Array.from(grouped.entries())
      .map(([key, value]) => ({
        key,
        label: value.label,
        expense: value.expense,
        order: value.order,
      }))
      .sort((a, b) => a.order - b.order)
      .slice(-12)
      .map(({ key, label, expense }) => ({ key, label, expense }));
  }, [filteredTransactions, period]);

  const net = summary.income - summary.expense;

  if (isLoading) {
    return <ReportLoadingState />;
  }

  if (error || !data) {
    return <ReportErrorState message={error || "Unable to load report data."} onRetry={() => window.location.reload()} />;
  }

  function handleLogout() {
    logout();
    setIsDrawerOpen(false);
    router.replace("/login");
  }

  const hasNoData = data.transactions.length === 0;

  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[#0f0f10] text-white">
      <DashboardBackground />

      <div className="relative flex min-h-screen">
        {isSidebarOpen ? (
          <div className="hidden md:block md:pb-12 md:pl-8 md:pt-0">
            <DashboardSidebarCard onLogout={handleLogout} />
          </div>
        ) : null}

        <div className="relative mx-auto w-full max-w-full flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+6.6rem)] pt-2.5 md:px-8 md:pb-12 md:pt-0">
          <DashboardNavbar
            dateLabel={getPeriodLabel(period)}
            greeting={getGreeting()}
            isSidebarOpen={isSidebarOpen}
            onAddTransaction={() => router.push("/transactions")}
            onMenuClick={() => {
              const mediaQuery = window.matchMedia("(min-width: 768px)");
              if (mediaQuery.matches) {
                setIsSidebarOpen((current) => !current);
              } else {
                setIsDrawerOpen(true);
              }
            }}
            userName={data.user.name}
          />

          <div className="mx-auto max-w-7xl space-y-4 md:space-y-6">
            <section>
              <h1 className="text-2xl font-semibold text-white md:text-3xl">Report</h1>
              <p className="mt-1 text-sm text-white/60 md:text-base">
                Simple insights for your income and spending.
              </p>
            </section>

            <ReportPeriodFilter onChange={setPeriod} period={period} />

            {hasNoData ? (
              <ReportEmptyState />
            ) : (
              <>
                <ReportSummaryCards
                  expense={summary.expense}
                  income={summary.income}
                  net={net}
                  transactionCount={filteredTransactions.length}
                />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <ReportCategoryBreakdown items={categoryBreakdown} />
                  <ReportTransactionTrend items={trendItems} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav
        onAddTransaction={() => router.push("/transactions")}
        onLogout={handleLogout}
      />

      <DashboardDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
      />
    </main>
  );
}

function getPeriodRange(period: ReportPeriod): { start: Date | null; end: Date | null } {
  const now = new Date();

  if (period === "all_time") {
    return { start: null, end: null };
  }

  if (period === "this_month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  if (period === "last_month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
    end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
  };
}

function getPeriodLabel(period: ReportPeriod): string {
  if (period === "this_month") {
    return "This Month";
  }
  if (period === "last_month") {
    return "Last Month";
  }
  if (period === "this_year") {
    return "This Year";
  }

  return "All Time";
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
