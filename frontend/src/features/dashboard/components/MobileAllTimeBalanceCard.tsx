"use client";

import { motion } from "framer-motion";

import { formatRupiah } from "@/lib/format";

type MobileAllTimeBalanceCardProps = {
  balance: number;
};

export function MobileAllTimeBalanceCard({
  balance,
}: MobileAllTimeBalanceCardProps) {
  const balanceTone = balance < 0 ? "text-[var(--accent-red)]" : "text-[var(--text-primary)]";

  return (
    <section className="px-7 md:hidden">
      <div className="relative min-h-[118px] rounded-[28px] border border-[var(--border-muted)] bg-[var(--surface-base)] px-6 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <p className="relative max-w-full text-left font-sans uppercase leading-5 tracking-[0.18em] text-[var(--text-secondary)]">
          <span className="text-[12px] font-medium">All-Time Balance • </span>
          <span className="text-[10px] font-medium tracking-[0.16em]">Across all transactions</span>
        </p>
        <motion.p
          className={`relative mt-4 max-w-full pr-2 text-[clamp(2.55rem,10.5vw,3.15rem)] font-semibold leading-[1.08] tracking-[-0.045em] ${balanceTone}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {formatRupiah(balance)}
        </motion.p>
      </div>
    </section>
  );
}
