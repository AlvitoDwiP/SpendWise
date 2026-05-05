"use client";

import Link from "next/link";

type AuthButtonsProps = {
  className?: string;
  mobile?: boolean;
};

export function AuthButtons({ className = "", mobile = false }: AuthButtonsProps) {
  return (
    <div
      className={`${className} flex items-center ${
        mobile ? "gap-2.5" : "gap-3"
      }`}
    >
      <Link
        className={`auth-login-btn ${mobile ? "h-9 px-4 text-[13px]" : "h-11 px-5 text-sm"}`}
        href="/login"
      >
        Login
      </Link>
      <Link
        className={`auth-register-btn ${mobile ? "h-9 px-4 text-[13px]" : "h-11 px-5 text-sm"}`}
        href="/register"
      >
        Register
      </Link>
    </div>
  );
}
