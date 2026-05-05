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
    <main className="app-shell relative grid min-h-screen place-items-center overflow-hidden px-5 text-white">
      <DashboardBackground />
      <section className="state-card relative w-full max-w-md text-center">
        <p className="text-lg font-semibold text-[var(--text-primary)]">Dashboard unavailable</p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
        <button
          className="btn-base btn-primary mt-6"
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
    <main className="app-shell relative min-h-screen overflow-hidden px-5 py-5 pb-28 text-white md:px-8 md:pb-12">
      <DashboardBackground />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="mb-6 hidden items-center justify-between gap-4 md:flex">
          <div className="flex items-center gap-4">
            <div className="skeleton-warm h-14 w-14 rounded-full" />
            <div>
              <div className="skeleton-warm h-5 w-52 rounded-full" />
              <div className="skeleton-warm mt-3 h-4 w-72 rounded-full" />
            </div>
          </div>
          <div className="skeleton-warm h-11 w-56 rounded-xl" />
        </div>

        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.42fr)_minmax(330px,0.78fr)]">
          <div className="space-y-6">
            <div className="skeleton-warm h-[360px] rounded-3xl border border-[var(--border-muted)] md:h-64 md:rounded-2xl" />
            <div className="skeleton-warm h-[420px] rounded-[1.75rem] border border-[var(--border-muted)] md:hidden" />
            <div className="hidden gap-4 md:grid md:grid-cols-2">
              <div className="skeleton-warm h-40 rounded-2xl border border-[var(--border-muted)]" />
              <div className="skeleton-warm h-40 rounded-2xl border border-[var(--border-muted)]" />
            </div>
            <div className="skeleton-warm hidden h-80 rounded-2xl border border-[var(--border-muted)] md:block" />
          </div>
          <div className="hidden space-y-6 md:block">
            <div className="skeleton-warm h-72 rounded-2xl border border-[var(--border-muted)]" />
            <div className="skeleton-warm h-96 rounded-2xl border border-[var(--border-muted)]" />
          </div>
        </div>
      </div>
    </main>
  );
}
