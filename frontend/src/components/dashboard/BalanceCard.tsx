import { LogOut } from "lucide-react";

import { formatRupiah } from "@/lib/format";

type BalanceCardProps = {
  balance: number;
  monthlyIncome: number;
  transactionCount: number;
  greeting: string;
  userName: string;
  onLogout: () => void;
};

export function BalanceCard({
  balance,
  monthlyIncome,
  transactionCount,
  greeting,
  userName,
  onLogout,
}: BalanceCardProps) {
  const balanceTone = balance < 0 ? "text-red-400" : "text-white";

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/12 bg-[#151723] p-6 shadow-2xl shadow-black/30 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.42),transparent_36%),radial-gradient(circle_at_100%_10%,rgba(244,63,94,0.24),transparent_28%)]" />
      <div className="relative">
        <div className="mb-10 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-slate-200 to-slate-500 text-lg font-bold text-slate-950">
              {getInitial(userName)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {greeting}, {userName}
              </h1>
              <p className="text-sm text-slate-300">
                Manage your finances with confidence today.
              </p>
            </div>
          </div>
          <button
            aria-label="Logout"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white"
            onClick={onLogout}
            type="button"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <p className="text-center text-base text-slate-300 lg:text-left">
          Current Balance
        </p>
        <p
          className={`mt-4 text-center text-5xl font-black tracking-tight lg:text-left lg:text-6xl ${balanceTone}`}
        >
          {formatRupiah(balance)}
        </p>

        <div className="mx-auto mt-6 flex w-fit items-center divide-x divide-white/10 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2 text-sm text-slate-300 lg:mx-0">
          <span className="pr-4 font-semibold text-emerald-400">
            +{formatRupiah(monthlyIncome)}
          </span>
          <span className="pl-4">
            <span className="font-bold text-purple-300">
              {transactionCount}
            </span>{" "}
            Transactions
          </span>
        </div>
      </div>
    </section>
  );
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}
