"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Folder,
  Home,
  List,
  LogOut,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";

type DashboardDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const menuItems: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Transactions", href: "/transactions", icon: List },
  { label: "Category", href: "/categories", icon: Folder },
  { label: "Report", href: "/report", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function DashboardDrawer({
  isOpen,
  onClose,
  onLogout,
}: DashboardDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <motion.button
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <motion.aside
            className="absolute inset-y-0 left-0 flex w-[300px] flex-col overflow-hidden rounded-r-3xl border-r border-white/10 bg-[#1c1c1e]/95 px-6 py-7 text-white shadow-[24px_0_80px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:w-80"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative mb-10 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
                  Menu
                </p>
                <p className="mt-2 text-lg font-semibold">SpendWise</p>
              </div>
              <motion.button
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white/75 transition hover:bg-white/15 hover:text-white"
                onClick={onClose}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <nav className="relative space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    className={`flex h-[52px] w-full items-center justify-between rounded-2xl px-4 text-left transition ${
                      isActive
                        ? "bg-purple-500/15 text-purple-300"
                        : "text-white/65 hover:bg-white/5 hover:text-white"
                    }`}
                    href={item.href}
                    key={item.label}
                    onClick={onClose}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </span>
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                    ) : null}
                  </Link>
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
        </div>
      ) : null}
    </AnimatePresence>
  );
}
