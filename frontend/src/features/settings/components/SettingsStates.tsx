"use client";

type SettingsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function SettingsLoadingState() {
  return (
    <main className="app-shell px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="app-desktop-page max-w-4xl space-y-4">
        <div className="skeleton-warm h-8 w-44 rounded-lg" />
        <div className="skeleton-warm h-72 rounded-[24px] border border-[var(--border-muted)]" />
        <div className="skeleton-warm h-44 rounded-[24px] border border-[var(--border-muted)]" />
      </div>
    </main>
  );
}

export function SettingsErrorState({ message, onRetry }: SettingsErrorStateProps) {
  return (
    <main className="app-shell grid min-h-screen place-items-center px-4 text-white">
      <div className="state-card state-card-danger w-full max-w-md text-center">
        <h1 className="text-lg font-semibold text-[var(--accent-red)]">Failed to load settings</h1>
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
