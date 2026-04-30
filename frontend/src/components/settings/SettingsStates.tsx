"use client";

type SettingsErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function SettingsLoadingState() {
  return (
    <main className="min-h-screen bg-[#0f0f10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl animate-pulse space-y-4">
        <div className="h-8 w-44 rounded-lg bg-white/10" />
        <div className="h-72 rounded-2xl bg-white/10" />
        <div className="h-44 rounded-2xl bg-white/10" />
      </div>
    </main>
  );
}

export function SettingsErrorState({ message, onRetry }: SettingsErrorStateProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0f0f10] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-200">Failed to load settings</h1>
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
