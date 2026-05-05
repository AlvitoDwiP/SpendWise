"use client";

type ReportErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ReportLoadingState() {
  return (
    <main className="app-shell px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="app-desktop-page space-y-4">
        <div className="skeleton-warm h-8 w-40 rounded-lg" />
        <div className="skeleton-warm h-20 rounded-[24px] border border-[var(--border-muted)]" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="skeleton-warm h-24 rounded-[24px] border border-[var(--border-muted)]" key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function ReportErrorState({ message, onRetry }: ReportErrorStateProps) {
  return (
    <main className="app-shell grid min-h-screen place-items-center px-4 text-white">
      <div className="state-card state-card-danger w-full max-w-md text-center">
        <h1 className="text-lg font-semibold text-[var(--accent-red)]">Failed to load report</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
        <button
          className="btn-base btn-danger mt-5"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      </div>
    </main>
  );
}

export function ReportEmptyState() {
  return (
    <section className="state-card text-center">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">No transaction yet</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Add your first transaction to start seeing spending insights.
      </p>
    </section>
  );
}
