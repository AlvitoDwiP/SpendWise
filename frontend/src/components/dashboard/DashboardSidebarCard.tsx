"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Folder,
  Home,
  List,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";

type DashboardSidebarCardProps = {
  onLogout: () => void;
};

const menuItems: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
}[] = [
  { label: "Home", icon: Home, active: true },
  { label: "Transactions", icon: List },
  { label: "Category", icon: Folder },
  { label: "Report", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

export function DashboardSidebarCard({
  onLogout,
}: DashboardSidebarCardProps) {
  return (
    <motion.aside
      className="relative w-[300px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1e]/90 p-5 text-white shadow-2xl shadow-black/25 backdrop-blur-xl md:flex md:flex-col md:min-h-[calc(100vh-3rem)]"
      initial={{ opacity: 0, x: -24, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ transformOrigin: "left center" }}
    >
      <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
          Menu
        </p>
        <p className="mt-2 text-xl font-semibold text-white">SpendWise</p>
      </div>

      <nav className="relative space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`flex h-[52px] w-full items-center justify-between rounded-2xl px-4 text-left transition ${
                item.active
                  ? "bg-purple-500/15 text-purple-300"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
              key={item.label}
              type="button"
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </span>
              {item.active ? (
                <span className="h-2 w-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="relative mt-auto border-t border-white/10 pt-5">
        <button
          className="flex h-[52px] w-full items-center gap-3 rounded-2xl px-4 text-left font-medium text-red-400 transition hover:bg-red-500/10"
          onClick={onLogout}
          type="button"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
