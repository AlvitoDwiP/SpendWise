import { Info, TrendingUp, WalletCards } from "lucide-react";

import { formatRupiah } from "@/lib/format";

type SummaryCardProps = {
  title: string;
  amount: number;
  tone: "income" | "expense";
};

export function SummaryCard({ title, amount, tone }: SummaryCardProps) {
  const isIncome = tone === "income";
  const Icon = isIncome ? TrendingUp : WalletCards;

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/25 backdrop-blur">
      <div
        className={`mb-6 grid h-16 w-16 place-items-center rounded-2xl ${
          isIncome
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <div className="flex items-center gap-2 text-slate-300">
        <p>{title}</p>
        <Info className="h-4 w-4 text-slate-500" />
      </div>
      <p
        className={`mt-3 text-3xl font-black ${
          isIncome ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatRupiah(amount)}
      </p>
    </article>
  );
}

type ThisMonthSummaryProps = {
  income: number;
  expense: number;
  transactionCount: number;
};

export function ThisMonthSummary({
  income,
  expense,
  transactionCount,
}: ThisMonthSummaryProps) {
  const net = income - expense;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur lg:p-8">
      <h2 className="text-2xl font-bold text-white">This Month</h2>
      <div className="mt-8 space-y-5">
        <SummaryRow label="Total Income" tone="income" value={income} />
        <SummaryRow label="Total Expense" tone="expense" value={expense} />
        <div className="flex items-center justify-between border-b border-white/10 pb-5 text-slate-300">
          <span>Transactions</span>
          <span className="font-bold text-white">{transactionCount}</span>
        </div>
        <SummaryRow label="Net" tone={net < 0 ? "expense" : "income"} value={net} />
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-5 text-slate-300">
      <span>{label}</span>
      <span
        className={`font-black ${
          tone === "income" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatRupiah(value)}
      </span>
    </div>
  );
}
