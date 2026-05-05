import { formatRupiah } from "@/lib/format";

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
    <section className="warm-panel-compact p-4">
      <p className="page-label text-[12px]">{label}</p>
      <p className={`mt-3 text-[clamp(1.5rem,5vw,2rem)] font-semibold leading-[1.08] tracking-[-0.04em] ${tone}`} style={{ fontFamily: "var(--font-serif)" }}>{value}</p>
    </section>
  );
}
