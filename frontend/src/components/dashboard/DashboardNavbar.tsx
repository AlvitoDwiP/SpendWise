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
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white shadow-xl shadow-black/20 backdrop-blur-md transition hover:bg-white/10"
          onClick={onMenuClick}
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
        >
          <Menu className="h-6 w-6" />
        </motion.button>

        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white">
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
            <h1 className="truncate text-2xl font-semibold text-white">
              {greeting}, {userName}
            </h1>
          </div>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/60">
            Take full control of your financial future starting today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {monthOptions.length > 0 && onMonthChange && selectedMonthKey ? (
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <select
              className="h-[42px] min-w-[190px] appearance-none rounded-xl border border-white/10 bg-white/5 pl-9 pr-9 text-sm font-medium text-white/80 outline-none backdrop-blur-md transition hover:bg-white/10 focus:border-purple-400/40"
              onChange={(event) => onMonthChange(event.target.value)}
              value={selectedMonthKey}
            >
              {monthOptions.map((option) => (
                <option className="bg-[#1c1c1e] text-white" key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <motion.button
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20"
          onClick={onAddTransaction}
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
        >
          <Plus className="h-5 w-5" />
          <span>Add</span>
        </motion.button>
      </div>
    </header>
  );
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}
