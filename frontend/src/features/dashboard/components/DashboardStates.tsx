import { DashboardBackground } from "./DashboardBackground";

type DashboardErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function DashboardErrorState({
  message,
  onRetry,
}: DashboardErrorStateProps) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0f0f10] px-5 text-white">
      <DashboardBackground />
      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-lg font-semibold">Dashboard unavailable</p>
        <p className="mt-3 text-sm leading-6 text-white/55">{message}</p>
        <button
          className="mt-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02]"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      </section>
    </main>
  );
}

export function DashboardLoadingState() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f0f10] px-5 py-5 pb-28 text-white md:px-8 md:pb-12">
      <DashboardBackground />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="mb-6 hidden items-center justify-between gap-4 md:flex">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-full bg-white/5" />
            <div>
              <div className="h-5 w-52 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-72 animate-pulse rounded-full bg-white/5" />
            </div>
          </div>
          <div className="h-11 w-56 animate-pulse rounded-xl bg-white/5" />
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.78fr)]">
          <div className="space-y-6">
            <div className="h-[360px] animate-pulse rounded-3xl border border-white/10 bg-white/5 md:h-64 md:rounded-2xl" />
            <div className="h-[420px] animate-pulse rounded-[1.75rem] border border-white/10 bg-white/5 md:hidden" />
            <div className="hidden gap-4 md:grid md:grid-cols-2">
              <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
              <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            </div>
            <div className="hidden h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5 md:block" />
          </div>
          <div className="hidden space-y-6 md:block">
            <div className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
          </div>
        </div>
      </div>
    </main>
  );
}
