"use client";

import { motion } from "framer-motion";

import { formatRupiah } from "@/lib/format";

type BalanceHeroCardProps = {
  balance: number;
  greeting?: string;
  profilePhotoUrl?: string | null;
  userName?: string;
};

export function BalanceHeroCard({
  balance,
  greeting,
  profilePhotoUrl,
  userName,
}: BalanceHeroCardProps) {
  const balanceTone = balance < 0 ? "text-red-400" : "text-white";

  return (
    <section className="relative w-full max-w-full px-0">
      <div className="pointer-events-none absolute left-1/2 top-[56%] h-24 w-64 -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl md:top-[60%] md:h-28 md:w-80" />
      <motion.div
        className="relative py-0.5 md:py-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {greeting && userName ? (
          <div className="mb-2.5 flex items-center gap-2 md:hidden">
            <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-[11px] font-semibold text-white">
              {profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${userName} profile`}
                  className="h-full w-full object-cover"
                  src={profilePhotoUrl}
                />
              ) : (
                getInitial(userName)
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[13px] font-semibold text-white">
                {greeting}, {userName}
              </h1>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-3.5 text-white/60">
                Take full control of your financial future starting today.
              </p>
            </div>
          </div>
        ) : null}

        <p className="text-center text-sm font-medium text-white/65 md:text-base">
          All-Time Balance • Across all transactions
        </p>
        <motion.p
          className={`mt-2.5 max-w-full break-words text-center text-[clamp(2rem,8vw,2.6rem)] font-semibold leading-[1.03] tracking-tight sm:text-6xl md:text-7xl ${balanceTone}`}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <motion.span
            animate={{
              textShadow: [
                "0 0 0px rgba(255,255,255,0)",
                "0 0 16px rgba(255,255,255,0.22)",
                "0 0 0px rgba(255,255,255,0)",
              ],
            }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          >
            {formatRupiah(balance)}
          </motion.span>
        </motion.p>
      </motion.div>
    </section>
  );
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}
