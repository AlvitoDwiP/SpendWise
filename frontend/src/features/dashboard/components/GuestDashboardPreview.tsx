"use client";

import { CalendarDays, ChevronDown, Menu, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { AuthButtons } from "@/components/auth/AuthButtons";
import { DashboardBackground } from "@/features/dashboard/components/DashboardBackground";
import { BalanceHeroCard } from "@/features/dashboard/components/BalanceHeroCard";
import { BalanceStatsCards } from "@/features/dashboard/components/BalanceStatsCards";
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

const monthOptions = [
  {
    key: new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "2-digit",
    })
      .format(new Date())
      .replace("/", "-"),
    label: new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(new Date()),
  },
];

export function GuestDashboardPreview() {
  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[var(--background)] text-[var(--text-primary)]">
      <DashboardBackground />
      <AuthButtons className="guest-mobile-auth-actions md:hidden" mobile />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-1 px-0 pb-[calc(env(safe-area-inset-bottom)+7.5rem)] pt-0 md:max-w-full md:px-8 md:pb-12 md:pt-0">
        <div className="space-y-5 pb-2 md:hidden">
          <MobileDashboardHeader
            greeting={getGreeting()}
            isGuest
            userName="Guest"
          />
          <section className="px-7 pt-2">
            <MobileMonthFilter
              monthOptions={monthOptions}
              onMonthChange={() => undefined}
              selectedMonthKey={monthOptions[0].key}
            />
          </section>
          <MobileAllTimeBalanceCard balance={0} />
          <section className="grid grid-cols-2 gap-4 px-7">
            <MobileMetricCard
              accentClassName="bg-[var(--accent-green-soft)] text-[var(--accent-green)]"
              amountClassName="text-[var(--accent-green)]"
              bars={[0, 0, 0, 0, 0, 0]}
              borderClassName="border-[rgba(95,197,142,0.24)]"
              icon={TrendingUp}
              label="Income"
              sublabel="This Month"
              value={0}
            />
            <MobileMetricCard
              accentClassName="bg-[var(--accent-red-soft)] text-[var(--accent-red)]"
              amountClassName="text-[var(--accent-red)]"
              bars={[0, 0, 0, 0, 0, 0]}
              borderClassName="border-[rgba(216,124,124,0.24)]"
              icon={TrendingDown}
              label="Expense"
              sublabel="This Month"
              value={0}
            />
          </section>
          <section className="grid grid-cols-2 gap-4 px-7">
            <MobileFinancialSummaryCompactCard expense={0} income={0} />
            <MobileMonthlyTransactionsCard
              monthLabel={monthOptions[0].label}
              transactionCount={0}
            />
          </section>
          <MobileRecentTransactions
            emptyActionHref="/login"
            emptyActionLabel="Sign In"
            emptyDescription="Sign in to start tracking your income and expenses."
            emptyTitle="No transactions yet"
            onDeleteTransaction={() => undefined}
            onEditTransaction={() => undefined}
            seeAllHref="/login"
            transactions={[]}
          />
        </div>

        <motion.div
          className="hidden min-w-0 gap-4 md:mt-6 md:grid md:gap-7 lg:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.78fr)]"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="hidden min-w-0 space-y-4 md:block md:space-y-6">
            <div className="md:flex md:items-start md:gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--border-muted)] bg-[var(--surface-base)] text-[#c8bba8] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                <Menu className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="mb-3">
                  <AuthButtons />
                </div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="avatar-shell grid h-9 w-9 shrink-0 place-items-center text-xs font-semibold text-[var(--text-primary)]">
                    G
                  </div>
                  <h1 className="display-greeting truncate">
                    {getGreeting()}, Guest
                  </h1>
                </div>
                <p className="max-w-xl font-sans text-[16px] leading-6 text-[var(--text-secondary)]">
                  Take full control of your financial future starting today.
                </p>
              </div>
            </div>
            <BalanceHeroCard balance={0} greeting={getGreeting()} userName="Guest" />
            <BalanceStatsCards
              expense={0}
              income={0}
              monthLabel={monthOptions[0].label}
              transactionCount={0}
            />
            <SpendingOverviewCard activeMonthKey={monthOptions[0].key} transactions={[]} />
          </div>

          <div className="hidden min-w-0 space-y-5 md:block">
            <section className="warm-panel-compact p-4">
              <div className="flex items-center gap-3">
                <div className="relative min-w-0 flex-1">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c8bba8]" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <select
                    className="h-[44px] w-full appearance-none rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-raised)] pl-9 pr-9 text-sm font-medium text-[#c8bba8] outline-none"
                    value={monthOptions[0].key}
                    onChange={() => undefined}
                  >
                    <option className="bg-[#211d18] text-white" value={monthOptions[0].key}>
                      {monthOptions[0].label}
                    </option>
                  </select>
                </div>
                <span className="auth-login-btn h-[44px] px-4 text-sm">
                  Add
                </span>
              </div>
            </section>
            <ThisMonthSummaryCard
              activeMonthExpense={0}
              compact
              net={0}
              totalExpenseAllTime={0}
              totalExpenseLast28Days={0}
              totalExpenseLast7Days={0}
            />
            <RecentTransactionsCard
              emptyActionHref="/login"
              emptyActionLabel="Sign In"
              emptyDescription="Sign in to start tracking your income and expenses."
              emptyTitle="No transactions yet"
              onDeleteTransaction={() => undefined}
              onEditTransaction={() => undefined}
              seeAllHref="/login"
              transactions={[]}
            />
          </div>
        </motion.div>
      </div>
    </div>
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
