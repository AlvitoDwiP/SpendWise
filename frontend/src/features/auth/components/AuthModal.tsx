"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type AuthModalProps = {
  children: ReactNode;
};

export function AuthModal({ children }: AuthModalProps) {
  return (
    <div className="auth-modal-shell fixed inset-0 z-[120] flex items-center justify-center px-4 py-6">
      <div className="auth-modal-overlay absolute inset-0" />
      <section className="auth-modal-card relative z-10 w-full max-w-[460px] overflow-hidden">
        <Link
          aria-label="Close authentication dialog"
          className="auth-close-btn"
          href="/dashboard"
        >
          <X className="h-4 w-4" />
        </Link>
        {children}
      </section>
    </div>
  );
}
