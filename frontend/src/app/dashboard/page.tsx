"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { BottomNavigation } from "@/components/dashboard/BottomNavigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SpendingOverview } from "@/components/dashboard/SpendingOverview";
import { SummaryCard, ThisMonthSummary } from "@/components/dashboard/SummaryCard";
import {
  getDashboardSummary,
  getRecentTransactions,
  type DashboardSummary,
  type Transaction,
  type User,
} from "@/lib/api";
import { getCurrentUser, isAuthenticated, logout } from "@/lib/auth";

type DashboardState = {
  user: User;
  summary: DashboardSummary;
  recentTransactions: Transaction[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace("/login");
          return;
        }

        const [summary, recentTransactions] = await Promise.all([
          getDashboardSummary(),
          getRecentTransactions(),
        ]);

        if (isMounted) {
          setDashboard({
            user,
            summary,
            recentTransactions,
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

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const greeting = useMemo(() => getGreeting(), []);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error || !dashboard) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070812] px-6 text-white">
        <section className="max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl shadow-black/40">
          <p className="text-lg font-bold">Dashboard unavailable</p>
          <p className="mt-3 text-sm text-slate-300">
            {error || "Unable to load dashboard data."}
          </p>
          <button
            className="mt-6 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white"
            onClick={() => window.location.reload()}
            type="button"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  const { user, summary, recentTransactions } = dashboard;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070812] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_62%_12%,rgba(124,58,237,0.22),transparent_28%),radial-gradient(circle_at_88%_0%,rgba(236,72,153,0.14),transparent_22%)]" />
      <div className="relative mx-auto flex w-full max-w-[1440px] gap-8 px-5 py-6 pb-32 md:px-8 lg:px-5 lg:pb-10">
        <Sidebar onLogout={handleLogout} />

        <div className="min-w-0 flex-1 space-y-7">
          <DashboardHeader
            greeting={greeting}
            userName={firstName(user.name)}
          />

          <div className="grid gap-7 lg:grid-cols-[1.25fr_0.95fr]">
            <BalanceCard
              balance={summary.current_balance}
              greeting={greeting}
              monthlyIncome={summary.this_month_income}
              onLogout={handleLogout}
              transactionCount={summary.this_month_transaction_count}
              userName={firstName(user.name)}
            />

            <ThisMonthSummary
              expense={summary.this_month_expense}
              income={summary.this_month_income}
              transactionCount={summary.this_month_transaction_count}
            />
          </div>

          <div className="grid gap-7 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="space-y-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <SummaryCard
                  amount={summary.this_month_income}
                  title="Income"
                  tone="income"
                />
                <SummaryCard
                  amount={summary.this_month_expense}
                  title="Expenses"
                  tone="expense"
                />
              </div>
              <SpendingOverview transactions={recentTransactions} />
            </div>

            <RecentTransactions transactions={recentTransactions} />
          </div>
        </div>
      </div>

      <BottomNavigation />
    </main>
  );
}

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#070812] px-5 py-6 text-white md:px-8">
      <div className="mx-auto flex max-w-[1440px] gap-8">
        <div className="hidden w-72 shrink-0 rounded-[2rem] bg-white/[0.04] lg:block" />
        <div className="grid flex-1 gap-7 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="h-72 animate-pulse rounded-[2rem] bg-white/[0.06]" />
          <div className="h-72 animate-pulse rounded-[2rem] bg-white/[0.06]" />
          <div className="h-96 animate-pulse rounded-[2rem] bg-white/[0.06]" />
          <div className="h-96 animate-pulse rounded-[2rem] bg-white/[0.06]" />
        </div>
      </div>
    </main>
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

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

function isAuthError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("authorization") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("token")
  );
}
