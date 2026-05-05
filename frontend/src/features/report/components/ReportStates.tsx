"use client";

type ReportErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ReportLoadingState() {
  return (
    <main className="min-h-screen bg-[#0f0f10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-4">
        <div className="h-8 w-40 rounded-lg bg-white/10" />
        <div className="h-20 rounded-2xl bg-white/10" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-24 rounded-2xl bg-white/10" key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}

export function ReportErrorState({ message, onRetry }: ReportErrorStateProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0f0f10] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-200">Failed to load report</h1>
        <p className="mt-2 text-sm text-red-200/90">{message}</p>
        <button
          className="mt-5 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/30"
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
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-white">No transaction yet</h2>
      <p className="mt-2 text-sm text-white/60">
        Add your first transaction to start seeing spending insights.
      </p>
    </section>
  );
}
