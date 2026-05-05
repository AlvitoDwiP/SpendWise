"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

import { AuthButtons } from "@/components/auth/AuthButtons";

type DashboardDrawerProps = {
  isAuthenticated?: boolean;
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
  isAuthenticated = true,
  isOpen,
  onClose,
  onLogout,
}: DashboardDrawerProps) {
  const pathname = usePathname();
  const router = useRouter();

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
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />

          <motion.aside
            className="absolute inset-y-0 left-0 flex w-[300px] flex-col overflow-hidden rounded-r-3xl border-r border-[#332c24] bg-[#1a1612] px-6 py-7 text-[var(--text-primary)] shadow-[24px_0_80px_rgba(0,0,0,0.42)] sm:w-80"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="relative mb-10 flex items-center justify-between">
              <div>
                <p className="page-label text-[12px]">
                  Menu
                </p>
                <p className="mt-2 font-sans text-[22px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">SpendWise</p>
                {!isAuthenticated ? <div className="mt-4"><AuthButtons /></div> : null}
              </div>
              <motion.button
                aria-label="Close menu"
                className="icon-button rounded-full"
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
                        ? "border border-[var(--border-muted)] bg-[rgba(237,226,200,0.08)] text-[var(--accent-cream)]"
                        : "text-[var(--text-secondary)] hover:bg-[rgba(237,226,200,0.06)] hover:text-[var(--text-primary)]"
                    }`}
                    href={isAuthenticated || item.href === "/dashboard" ? item.href : "/login"}
                    key={item.label}
                    onClick={onClose}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-sans text-[15px] font-medium">{item.label}</span>
                    </span>
                    {isActive ? (
                      <span className="h-2 w-2 rounded-full bg-[var(--accent-green)]" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <div className="relative mt-auto border-t border-[#332c24] pt-5">
              {isAuthenticated ? (
                <button
                  className="flex h-[52px] w-full items-center gap-3 rounded-2xl px-4 text-left font-medium text-[var(--accent-red)] transition hover:bg-[rgba(216,124,124,0.10)]"
                  onClick={onLogout}
                  type="button"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-sans text-[15px] font-medium">Logout</span>
                </button>
              ) : (
                <button
                  className="auth-login-btn w-full justify-center"
                  onClick={() => {
                    onClose();
                    router.push("/login");
                  }}
                  type="button"
                >
                  Masuk untuk menggunakan fitur ini
                </button>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
