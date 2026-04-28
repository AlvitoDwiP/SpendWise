"use client";

import { BarChart3, Home, Plus } from "lucide-react";
import { motion } from "framer-motion";

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-5 left-4 right-4 z-40 h-[76px] rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden">
      <div className="grid h-full grid-cols-3 items-center px-6">
        <button
          className="flex flex-col items-center gap-1 text-purple-300"
          type="button"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs font-medium">Home</span>
        </button>

        <div aria-hidden />

        <button
          className="flex flex-col items-center gap-1 text-white/45 transition hover:text-white/70"
          type="button"
        >
          <BarChart3 className="h-6 w-6" />
          <span className="text-xs font-medium">Report</span>
        </button>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.button
          aria-label="Add transaction"
          className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 ring-8 ring-purple-500/10"
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
        >
          <Plus className="h-9 w-9" />
        </motion.button>
      </div>
    </nav>
  );
}
