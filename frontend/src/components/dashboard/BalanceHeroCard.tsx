"use client";

import { motion } from "framer-motion";

import { formatRupiah } from "../../lib/format";

type BalanceHeroCardProps = {
  balance: number;
  greeting?: string;
  userName?: string;
};

export function BalanceHeroCard({
  balance,
  greeting,
  userName,
}: BalanceHeroCardProps) {
  const balanceTone = balance < 0 ? "text-red-400" : "text-white";

  return (
    <motion.section
      className="relative w-full max-w-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/5 p-3.5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-5 md:min-h-[250px] md:rounded-2xl md:p-8"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/25 via-transparent to-pink-500/10 blur-2xl md:from-purple-500/20" />
      <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-indigo-400/12 blur-3xl" />

      <div className="relative">
        {greeting && userName ? (
          <div className="mb-4.5 flex items-center gap-2 md:hidden">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-[11px] font-semibold text-white">
              {getInitial(userName)}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold text-white">
                {greeting}, {userName} ☀️
              </h1>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-3.5 text-white/60">
                Manage your finances with confidence today.
              </p>
            </div>
          </div>
        ) : null}

        <p className="text-center text-sm font-medium text-white/65 md:text-left md:text-base">
          All-Time Balance • Across all transactions
        </p>
        <p
          className={`mt-2.5 max-w-full break-words text-center text-[clamp(1.65rem,7.2vw,2.2rem)] font-semibold leading-[1.03] tracking-tight sm:text-5xl md:text-left md:text-6xl ${balanceTone}`}
        >
          {formatRupiah(balance)}
        </p>

      </div>
    </motion.section>
  );
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}
