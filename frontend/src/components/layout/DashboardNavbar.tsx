"use client";

import { CalendarDays, ChevronDown, Menu, Plus } from "lucide-react";
import { motion } from "framer-motion";

type MonthOption = {
  key: string;
  label: string;
};

type DashboardNavbarProps = {
  greeting: string;
  isSidebarOpen?: boolean;
  monthOptions?: MonthOption[];
  onAddTransaction: () => void;
  onMenuClick: () => void;
  onMonthChange?: (key: string) => void;
  profilePhotoUrl?: string | null;
  selectedMonthKey?: string;
  userName: string;
};

export function DashboardNavbar({
  greeting,
  isSidebarOpen = true,
  monthOptions = [],
  onAddTransaction,
  onMenuClick,
  onMonthChange,
  profilePhotoUrl,
  selectedMonthKey,
  userName,
}: DashboardNavbarProps) {
  return (
    <header className="relative z-20 hidden items-center justify-between gap-6 py-7 md:flex">
      <div className="flex min-w-0 items-center gap-4">
        <motion.button
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[var(--border-muted)] bg-[var(--surface-base)] text-[#c8bba8] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition hover:bg-[var(--surface-elevated)]"
          onClick={onMenuClick}
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
        >
          <Menu className="h-6 w-6" />
        </motion.button>

        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-3">
            <div className="avatar-shell grid h-10 w-10 shrink-0 place-items-center text-xs font-semibold text-[var(--text-primary)]">
              {profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${userName} profile`}
                  className="h-full w-full object-cover"
                  src={profilePhotoUrl}
                />
              ) : (
                getInitial(userName)
              )}
            </div>
            <h1 className="display-greeting truncate">
              {greeting}, {userName}
            </h1>
          </div>
          <p className="mt-1 max-w-xl font-sans text-[16px] leading-6 text-[var(--text-secondary)]">
            Take full control of your financial future starting today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {monthOptions.length > 0 && onMonthChange && selectedMonthKey ? (
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c8bba8]" />
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <select
              className="h-[44px] min-w-[190px] appearance-none rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-raised)] pl-9 pr-9 text-sm font-medium text-[#c8bba8] outline-none transition hover:bg-[var(--surface-base)] focus:border-[var(--border-active)]"
              onChange={(event) => onMonthChange(event.target.value)}
              value={selectedMonthKey}
            >
              {monthOptions.map((option) => (
                <option className="bg-[#211d18] text-white" key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <motion.button
          className="btn-base btn-primary rounded-2xl px-5"
          onClick={onAddTransaction}
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
        >
          <Plus className="h-5 w-5 text-[#181410]" />
          <span>Add</span>
        </motion.button>
      </div>
    </header>
  );
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}
