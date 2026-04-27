"use client";

import {
  BarChart3,
  CircleHelp,
  Folder,
  Home,
  List,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";

type SidebarProps = {
  onLogout: () => void;
};

const menuItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Transactions", icon: List },
  { label: "Categories", icon: Folder },
  { label: "Report", icon: BarChart3 },
];

const accountItems = [
  { label: "Profile", icon: User },
  { label: "Settings", icon: Settings },
  { label: "Help & Support", icon: CircleHelp },
];

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-white/[0.06] text-white shadow-2xl shadow-black/30">
        <Menu className="h-8 w-8" />
      </div>

      <div className="relative min-h-[calc(100vh-7rem)] rounded-[2rem] border border-white/12 bg-[#141622]/80 p-6 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="absolute -top-3 left-8 h-5 w-9 rounded-t-full border-x border-t border-white/12 bg-[#141622]" />
        <div className="mb-10 flex justify-end">
          <button
            aria-label="Close menu"
            className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="space-y-9">
          <NavGroup label="Menu" items={menuItems} />
          <NavGroup label="Account" items={accountItems} />
        </nav>

        <div className="mt-9 border-t border-white/10 pt-6">
          <button
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-red-400 transition hover:bg-red-500/10"
            onClick={onLogout}
            type="button"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-base font-semibold">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

type NavGroupProps = {
  label: string;
  items: {
    label: string;
    icon: typeof Home;
    active?: boolean;
  }[];
};

function NavGroup({ label, items }: NavGroupProps) {
  return (
    <div>
      <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                item.active
                  ? "bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-950/30"
                  : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
              }`}
              key={item.label}
              type="button"
            >
              <span className="flex items-center gap-4">
                <Icon className="h-6 w-6" />
                <span className="text-base font-semibold">{item.label}</span>
              </span>
              {item.active ? (
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-lg shadow-purple-500/70" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
