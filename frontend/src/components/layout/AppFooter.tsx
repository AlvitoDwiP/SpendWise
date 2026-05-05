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

  if (usesMobileNav) {
    return null;
  }

  return (
    <footer
      className={
        isAuthRoute
          ? "border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-500"
          : "border-t border-white/10 bg-[#1c1c1e]/85 px-4 py-3 text-center text-xs text-white/45 backdrop-blur-xl"
      }
    >
      SpendWise © {currentYear}
    </footer>
  );
}
