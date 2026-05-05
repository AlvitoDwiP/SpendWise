"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

import { AuthButtons } from "@/components/auth/AuthButtons";

type DashboardSidebarCardProps = {
  isAuthenticated?: boolean;
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

export function DashboardSidebarCard({
  isAuthenticated = true,
  onLogout,
}: DashboardSidebarCardProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      className="relative w-[300px] shrink-0 overflow-hidden rounded-[24px] border border-[#332c24] bg-[#1a1612] p-5 text-[var(--text-primary)] shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:flex md:flex-col md:min-h-[calc(100vh-3rem)]"
      initial={{ opacity: 0, x: -24, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      style={{ transformOrigin: "left center" }}
    >
      <div className="relative mb-8">
        <p className="page-label text-[12px]">
          Menu
        </p>
        <p className="mt-2 font-sans text-[24px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">SpendWise</p>
        {!isAuthenticated ? <div className="mt-4"><AuthButtons /></div> : null}
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

      {isAuthenticated ? (
        <div className="relative mt-auto border-t border-[#332c24] pt-5">
          <button
            className="flex h-[52px] w-full items-center gap-3 rounded-2xl px-4 text-left font-medium text-[var(--accent-red)] transition hover:bg-[rgba(216,124,124,0.10)]"
            onClick={onLogout}
            type="button"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-sans text-[15px] font-medium">Logout</span>
          </button>
        </div>
      ) : null}
    </motion.aside>
  );
}
