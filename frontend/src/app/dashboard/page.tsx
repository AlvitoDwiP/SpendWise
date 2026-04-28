"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { BalanceHeroCard } from "../../components/dashboard/BalanceHeroCard";
import { BalanceStatsCards } from "../../components/dashboard/BalanceStatsCards";
import { DashboardBackground } from "../../components/dashboard/DashboardBackground";
import { DashboardDrawer } from "../../components/dashboard/DashboardDrawer";
import { DashboardNavbar } from "../../components/dashboard/DashboardNavbar";
import { DashboardSidebarCard } from "../../components/dashboard/DashboardSidebarCard";
import { AnimatePresence } from "framer-motion";
import {
  DashboardErrorState,
  DashboardLoadingState,
} from "../../components/dashboard/DashboardStates";
import { MobileBalancePanel } from "../../components/dashboard/MobileBalancePanel";
import { MobileBottomNav } from "../../components/dashboard/MobileBottomNav";
import { RecentTransactionsCard } from "../../components/dashboard/RecentTransactionsCard";
import { SpendingOverviewCard } from "../../components/dashboard/SpendingOverviewCard";
import { ThisMonthSummaryCard } from "../../components/dashboard/ThisMonthSummaryCard";
import {
  getDashboardSummary,
  getMe,
  getRecentTransactions,
  getToken,
  type DashboardSummary,
  type Transaction,
  type User,
} from "../../lib/api";
import { logout } from "../../lib/auth";

type DashboardState = {
  user: User;
  summary: DashboardSummary;
  recentTransactions: Transaction[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
        const [user, summary, recentTransactions] = await Promise.all([
          getMe(),
          getDashboardSummary(),
          getRecentTransactions(),
        ]);

        if (isMounted) {
          setDashboard({ user, summary, recentTransactions });
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

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const dateLabel = useMemo(() => getCurrentMonthLabel(), []);
  const greeting = useMemo(() => getGreeting(), []);

  function handleLogout() {
    logout();
    setIsDrawerOpen(false);
    router.replace("/login");
  }

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (error || !dashboard) {
    return (
      <DashboardErrorState
        message={error || "Unable to load dashboard data."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const { recentTransactions, summary, user } = dashboard;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0f0f10] text-white">
      <DashboardBackground />

      <motion.div
        className="relative flex min-h-screen"
        layout
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {/* Desktop Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ transformOrigin: "left center" }}
              className="hidden md:block md:pt-0 md:pb-12 md:pl-8"
            >
              <DashboardSidebarCard onLogout={handleLogout} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="relative mx-auto w-full flex-1 px-5 pb-28 pt-5 md:px-8 md:pb-12 md:pt-0">
          <DashboardNavbar
            dateLabel={dateLabel}
            greeting={greeting}
            isSidebarOpen={isSidebarOpen}
            onMenuClick={() => {
              const mediaQuery = window.matchMedia("(min-width: 768px)");
              if (mediaQuery.matches) {
                setIsSidebarOpen(!isSidebarOpen);
              } else {
                setIsDrawerOpen(true);
              }
            }}
            userName={user.name}
          />

          <motion.div
            className="grid gap-7 lg:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.78fr)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            layout
          >
          <div className="space-y-6">
            <BalanceHeroCard
              balance={summary.current_balance}
              greeting={greeting}
              monthlyIncome={summary.this_month_income}
              transactionCount={summary.this_month_transaction_count}
              userName={user.name}
            />
            <MobileBalancePanel
              expense={summary.this_month_expense}
              income={summary.this_month_income}
              transactions={recentTransactions}
            />
            <div className="hidden md:block">
              <BalanceStatsCards
                expense={summary.this_month_expense}
                income={summary.this_month_income}
              />
            </div>
            <div className="hidden md:block">
              <SpendingOverviewCard
                monthlyExpense={summary.this_month_expense}
                transactions={recentTransactions}
              />
            </div>
          </div>

          <div className="hidden space-y-6 md:block">
            <ThisMonthSummaryCard
              expense={summary.this_month_expense}
              income={summary.this_month_income}
              transactionCount={summary.this_month_transaction_count}
            />
            <RecentTransactionsCard transactions={recentTransactions} />
          </div>
        </motion.div>
        </div>
      </motion.div>

      <MobileBottomNav />
      <DashboardDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
      />
    </main>
  );
}

function getCurrentMonthLabel(): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date());
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
