import { formatRupiah } from "../../lib/format";

type CategoryItem = {
  key: string;
  name: string;
  total: number;
  percentage: number;
};

type ReportCategoryBreakdownProps = {
  items: CategoryItem[];
};

export function ReportCategoryBreakdown({ items }: ReportCategoryBreakdownProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#1c1c1e]/85 p-4 shadow-xl shadow-black/15 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-white">Spending by Category</h2>
      <p className="mt-1 text-sm text-white/55">Expense grouped from biggest to smallest.</p>

      {items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-sm text-white/55">
          No expense data in selected period.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li className="space-y-2" key={item.key}>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-white">{item.name}</p>
                <p className="shrink-0 text-sm text-red-300">{formatRupiah(item.total)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-400/80 to-red-500"
                    style={{ width: `${Math.min(100, Math.max(item.percentage, 0))}%` }}
                  />
                </div>
                <p className="w-12 shrink-0 text-right text-xs text-white/55">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export type { CategoryItem };
