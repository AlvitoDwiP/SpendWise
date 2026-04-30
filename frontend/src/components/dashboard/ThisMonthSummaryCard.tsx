import { formatRupiah } from "../../lib/format";

type ThisMonthSummaryCardProps = {
  expense: number;
  income: number;
  transactionCount: number;
};

export function ThisMonthSummaryCard({
  expense,
  income,
  transactionCount,
}: ThisMonthSummaryCardProps) {
  const net = income - expense;

  return (
    <section className="min-h-[270px] rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-semibold text-white">This Month</h2>
      <p className="mt-1 text-xs text-white/50">Only transactions in current month.</p>
      <div className="mt-6 space-y-4">
        <SummaryRow label="Total Income" tone="income" value={income} />
        <SummaryRow label="Total Expense" tone="expense" value={expense} />
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-sm text-white/55">
          <span>Transactions</span>
          <span className="font-semibold text-white">{transactionCount}</span>
        </div>
        <SummaryRow label="Net" tone={net < 0 ? "expense" : "income"} value={net} />
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "income" | "expense";
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-4 text-sm text-white/55">
      <span>{label}</span>
      <span
        className={`font-semibold ${
          tone === "income" ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatRupiah(value)}
      </span>
    </div>
  );
}
