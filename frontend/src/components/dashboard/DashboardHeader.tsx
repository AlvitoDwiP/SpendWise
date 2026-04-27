import { Calendar, ChevronDown, Menu, Plus } from "lucide-react";

type DashboardHeaderProps = {
  greeting: string;
  userName: string;
};

export function DashboardHeader({ greeting, userName }: DashboardHeaderProps) {
  return (
    <header className="hidden items-center justify-between gap-6 lg:flex">
      <div className="flex items-start gap-5">
        <button
          aria-label="Open menu"
          className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/12 bg-white/[0.06] text-white shadow-xl shadow-black/30"
          type="button"
        >
          <Menu className="h-7 w-7" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {userName}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Manage your finances with confidence today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button
          className="flex h-14 items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.08] px-6 text-sm font-medium text-slate-200 shadow-xl shadow-black/20"
          type="button"
        >
          <Calendar className="h-5 w-5 text-slate-300" />
          <span>March 2026</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <button
          className="flex h-14 items-center gap-3 rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 text-base font-bold text-white shadow-2xl shadow-purple-950/50 transition hover:scale-[1.01]"
          type="button"
        >
          <Plus className="h-6 w-6" />
          <span>Add</span>
        </button>
      </div>
    </header>
  );
}
