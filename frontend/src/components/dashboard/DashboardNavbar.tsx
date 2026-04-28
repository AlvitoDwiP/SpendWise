"use client";

import { CalendarDays, ChevronDown, Menu, Plus } from "lucide-react";
import { motion } from "framer-motion";

type DashboardNavbarProps = {
  dateLabel: string;
  greeting: string;
  onMenuClick: () => void;
  userName: string;
};

export function DashboardNavbar({
  dateLabel,
  greeting,
  onMenuClick,
  userName,
}: DashboardNavbarProps) {
  return (
    <header className="relative z-20 hidden items-center justify-between gap-6 py-7 md:flex">
      <div className="flex min-w-0 items-center gap-4">
        <motion.button
          aria-label="Open menu"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white shadow-xl shadow-black/20 backdrop-blur-md transition hover:bg-white/10"
          onClick={onMenuClick}
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <Menu className="h-6 w-6" />
        </motion.button>

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-white">
            {greeting}, {userName} ☀️
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/60">
            Manage your finances with confidence today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/75 backdrop-blur-md transition hover:bg-white/10"
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-white/60" />
          <span className="truncate">{dateLabel}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-white/50" />
        </motion.button>

        <motion.button
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20"
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
