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
  const balanceTone = balance < 0 ? "text-[var(--accent-red)]" : "text-[var(--text-primary)]";

  return (
    <section className="relative w-full max-w-full px-0">
      <motion.div
        className="relative py-0.5 md:py-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {greeting && userName ? (
          <div className="mb-2.5 flex items-center gap-2 md:hidden">
            <div className="avatar-shell grid h-8 w-8 shrink-0 place-items-center text-[11px] font-semibold text-[var(--text-primary)]">
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
              <h1 className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                {greeting}, {userName}
              </h1>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-3.5 text-[var(--text-secondary)]">
                Take full control of your financial future starting today.
              </p>
            </div>
          </div>
        ) : null}

        <p className="text-center font-sans text-sm font-medium text-[var(--text-secondary)] md:text-[16px]">
          All-Time Balance • Across all transactions
        </p>
        <motion.p
          className={`display-amount mt-2.5 max-w-full break-words text-center md:text-[clamp(2.55rem,6vw,4.875rem)] md:leading-none ${balanceTone}`}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <motion.span>
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
