"use client";

import { usePathname } from "next/navigation";

const AUTH_ROUTES = new Set(["/", "/login", "/register"]);
const APP_NAV_ROUTES = [
  "/dashboard",
  "/report",
  "/settings",
  "/categories",
  "/transactions",
];

export function AppFooter() {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const usesMobileNav = APP_NAV_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const currentYear = new Date().getFullYear();

  if (usesMobileNav || isAuthRoute) {
    return null;
  }

  return (
    <footer className="border-t border-[var(--border-muted)] bg-[var(--surface-base)] px-4 py-3 text-center text-xs text-[var(--text-muted)]">
      SpendWise © {currentYear}
    </footer>
  );
}
