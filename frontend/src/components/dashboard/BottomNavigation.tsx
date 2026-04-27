"use client";

import { BarChart3, Home, Plus } from "lucide-react";

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-5 bottom-5 z-30 rounded-[1.75rem] border border-white/10 bg-[#191b26]/95 px-8 py-4 shadow-2xl shadow-black/60 backdrop-blur md:hidden">
      <div className="grid grid-cols-3 items-center">
        <button
          className="flex flex-col items-center gap-1 text-purple-300"
          type="button"
        >
          <Home className="h-7 w-7" />
          <span className="text-xs font-semibold">Home</span>
        </button>

        <button
          aria-label="Add transaction"
          className="mx-auto -mt-12 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-2xl shadow-purple-500/40 ring-8 ring-purple-500/15"
          type="button"
        >
          <Plus className="h-10 w-10" />
        </button>

        <button
          className="flex flex-col items-center gap-1 text-slate-400"
          type="button"
        >
          <BarChart3 className="h-7 w-7" />
          <span className="text-xs font-semibold">Report</span>
        </button>
      </div>
    </nav>
  );
}
