"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEventHandler } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  BarChart3,
  Folder,
  Home,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  type LucideIcon,
} from "lucide-react";

type MobileBottomNavProps = {
  onAddTransaction: () => void;
  onLogout: () => void;
};

type MobileNavButtonProps = {
  href?: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

type MoreMenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  tone?: "default" | "danger";
};

type MobileMoreMenuProps = {
  onClose: () => void;
  onLogout: () => void;
};

type MobileMoreMenuItemProps = {
  item: MoreMenuItem;
  isActive: boolean;
  onClose: () => void;
  onLogout: () => void;
};

const moreMenuItems: MoreMenuItem[] = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Category", icon: Folder, href: "/categories" },
  { label: "Logout", icon: LogOut, tone: "danger" },
];

const menuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: { duration: 0.18, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.22,
      ease: "easeOut",
      staggerChildren: 0.06,
      when: "beforeChildren",
    },
  },
};

const menuItemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

export function MobileBottomNav({
  onAddTransaction,
  onLogout,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  function closeMoreMenu() {
    setIsMoreOpen(false);
  }

  function handleLogout() {
    closeMoreMenu();
    onLogout();
  }

  return (
    <>
      <AnimatePresence>
        {isMoreOpen ? (
          <motion.button
            aria-label="Close more menu"
            className="fixed inset-0 z-30 cursor-default bg-transparent md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMoreMenu}
            transition={{ duration: 0.16, ease: "easeOut" }}
            type="button"
          />
        ) : null}
      </AnimatePresence>

      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.55rem)] left-4 right-4 z-40 h-[62px] w-auto max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
      >
        <div className="grid h-full grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center px-2.5">
          <MobileNavButton
            active={pathname === "/dashboard" || pathname.startsWith("/dashboard/")}
            href="/dashboard"
            icon={Home}
            label="Home"
            onClick={closeMoreMenu}
          />

          <div aria-hidden />

          <div className="grid h-full grid-cols-2 items-center">
            <MobileNavButton
              active={pathname === "/report" || pathname.startsWith("/report/")}
              href="/report"
              icon={BarChart3}
              label="Report"
              onClick={closeMoreMenu}
            />

            <div className="relative flex h-full items-center justify-center">
              <AnimatePresence>
                {isMoreOpen ? (
                  <MobileMoreMenu
                    onClose={closeMoreMenu}
                    onLogout={handleLogout}
                  />
                ) : null}
              </AnimatePresence>

              <motion.button
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
                aria-label="More navigation options"
                className={`flex h-full min-w-0 flex-col items-center justify-center gap-0.5 text-center transition ${
                  isMoreOpen
                    ? "text-purple-300"
                    : "text-white/45 hover:text-white/70"
                }`}
                onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
                type="button"
                whileTap={{ scale: 0.94 }}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="text-[11px] font-medium">More</span>
              </motion.button>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <motion.button
            aria-label="Add transaction"
            className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 ring-8 ring-purple-500/10"
            onClick={() => {
              closeMoreMenu();
              onAddTransaction();
            }}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </div>
      </nav>
    </>
  );
}

function MobileNavButton({
  active = false,
  href,
  icon: Icon,
  label,
  onClick,
}: MobileNavButtonProps) {
  const className = `flex h-full min-w-0 flex-col items-center justify-center gap-0.5 text-center transition ${
    active ? "text-purple-300" : "text-white/45 hover:text-white/70"
  }`;

  if (href) {
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={className}
        href={href}
        onClick={onClick}
      >
        <Icon className="h-5 w-5" />
        <span className="text-[11px] font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <button
      aria-current={active ? "page" : undefined}
      className={className}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function MobileMoreMenu({ onClose, onLogout }: MobileMoreMenuProps) {
  const pathname = usePathname();

  return (
    <motion.div
      className="absolute bottom-[calc(100%+0.9rem)] right-0 z-50 flex origin-bottom-right flex-col items-end gap-2.5"
      initial="hidden"
      animate="visible"
      exit="hidden"
      role="menu"
      variants={menuVariants}
    >
      {moreMenuItems.map((item) => (
        <MobileMoreMenuItem
          isActive={
            item.href
              ? pathname === item.href || pathname.startsWith(`${item.href}/`)
              : false
          }
          item={item}
          key={item.label}
          onClose={onClose}
          onLogout={onLogout}
        />
      ))}
    </motion.div>
  );
}

function MobileMoreMenuItem({
  item,
  isActive,
  onClose,
  onLogout,
}: MobileMoreMenuItemProps) {
  const Icon = item.icon;
  const isDanger = item.tone === "danger";
  const itemClassName = `flex h-12 min-w-[140px] items-center gap-3 rounded-2xl border border-white/10 px-4 text-sm font-medium shadow-[0_18px_45px_rgba(0,0,0,0.32)] backdrop-blur-xl transition ${
    isDanger
      ? "text-red-300 hover:bg-red-500/10"
      : isActive
        ? "bg-purple-500/20 text-purple-200"
        : "bg-[#1c1c1e]/95 text-white/80 hover:bg-white/10 hover:text-white"
  }`;
  const iconClassName = `grid h-8 w-8 place-items-center rounded-full ${
    isDanger ? "bg-red-500/10 text-red-300" : "bg-purple-500/15 text-purple-300"
  }`;

  const content = (
    <>
      <span className={iconClassName}>
        <Icon className="h-4 w-4" />
      </span>
      <span>{item.label}</span>
    </>
  );

  return (
    <motion.div className="origin-bottom-right" variants={menuItemVariants}>
      {item.href ? (
        <Link
          className={itemClassName}
          href={item.href}
          onClick={onClose}
          role="menuitem"
        >
          {content}
        </Link>
      ) : (
        <button
          className={itemClassName}
          onClick={onLogout}
          role="menuitem"
          type="button"
        >
          {content}
        </button>
      )}
    </motion.div>
  );
}
