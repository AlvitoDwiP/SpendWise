import { formatRupiah } from "@/lib/format";

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
    <section className="warm-panel-compact p-4">
      <h2 className="section-title">Spending by Category</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Expense grouped from biggest to smallest.</p>

      {items.length === 0 ? (
        <p className="warm-elevated mt-5 px-3 py-4 text-sm text-[var(--text-secondary)]">
          No expense data in selected period.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li className="space-y-2" key={item.key}>
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                <p className="shrink-0 text-sm text-[var(--accent-red)]">{formatRupiah(item.total)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-input)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(216,124,124,0.72),rgba(216,124,124,0.95))]"
                    style={{ width: `${Math.min(100, Math.max(item.percentage, 0))}%` }}
                  />
                </div>
                <p className="w-12 shrink-0 text-right text-xs text-[var(--text-secondary)]">
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
