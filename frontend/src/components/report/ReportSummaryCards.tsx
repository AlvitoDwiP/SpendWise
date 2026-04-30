import { formatRupiah } from "../../lib/format";

type ReportSummaryCardsProps = {
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
};

export function ReportSummaryCards({
  income,
  expense,
  net,
  transactionCount,
}: ReportSummaryCardsProps) {
  const netTone = net < 0 ? "text-red-300" : "text-emerald-300";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label="Income" tone="text-emerald-300" value={formatRupiah(income)} />
      <SummaryCard label="Expense" tone="text-red-300" value={formatRupiah(expense)} />
      <SummaryCard label="Net" tone={netTone} value={formatRupiah(net)} />
      <SummaryCard
        label="Transactions"
        tone="text-white"
        value={new Intl.NumberFormat("id-ID").format(transactionCount)}
      />
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  tone: string;
};

function SummaryCard({ label, value, tone }: SummaryCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#1c1c1e]/85 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
      <p className="text-xs font-medium uppercase tracking-wide text-white/50">{label}</p>
      <p className={`mt-2 truncate text-xl font-semibold ${tone}`}>{value}</p>
    </section>
  );
}
