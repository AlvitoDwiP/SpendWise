import { ShoppingBag, Utensils } from "lucide-react";

import type { Transaction } from "@/lib/api";
import { formatRupiah, formatTransactionDate } from "@/lib/format";

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/25 backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-6 lg:border-b-0 lg:px-8">
        <div>
          <h2 className="text-xl font-bold text-white lg:text-2xl">
            Recent Transactions
          </h2>
          <p className="mt-2 text-sm uppercase tracking-wide text-slate-500 lg:hidden">
            Today
          </p>
        </div>
        <div className="text-right">
          <button
            className="hidden text-sm font-semibold text-purple-300 lg:block"
            type="button"
          >
            See all
          </button>
          <p className="text-sm text-slate-400 lg:hidden">
            Total -{formatRupiah(totalExpense)}
          </p>
        </div>
      </div>

      <div className="divide-y divide-white/10 px-6 pb-6 lg:px-8">
        {transactions.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No recent transactions yet.
          </div>
        ) : (
          transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))
        )}
      </div>
    </section>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isExpense = transaction.type === "expense";
  const categoryName = transaction.category?.name ?? transaction.type;
  const categoryIcon = transaction.category?.icon;

  return (
    <article className="flex items-center gap-4 py-5">
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-2xl text-amber-300">
        {categoryIcon ? (
          <span aria-hidden>{categoryIcon}</span>
        ) : isExpense ? (
          <Utensils className="h-7 w-7" />
        ) : (
          <ShoppingBag className="h-7 w-7" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold text-white">
          {transaction.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
            {categoryName}
          </span>
          {transaction.note ? (
            <span className="max-w-40 truncate rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
              {transaction.note}
            </span>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`text-base font-black ${
            isExpense ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {isExpense ? "-" : "+"}
          {formatRupiah(transaction.amount)}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {formatTransactionDate(transaction.transaction_date)}
        </p>
      </div>
    </article>
  );
}
