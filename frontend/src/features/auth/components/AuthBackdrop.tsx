"use client";

import type { ReactNode } from "react";

type AuthBackdropProps = {
  children: ReactNode;
};

export function AuthBackdrop({ children }: AuthBackdropProps) {
  return (
    <main className="app-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none select-none blur-auth-backdrop">
        {children}
      </div>
      <div className="auth-backdrop-dim pointer-events-none absolute inset-0 z-[90]" />
    </main>
  );
}
