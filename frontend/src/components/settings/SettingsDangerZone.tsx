"use client";

import { useState } from "react";

type SettingsDangerZoneProps = {
  onReset: () => Promise<void>;
};

export function SettingsDangerZone({ onReset }: SettingsDangerZoneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canConfirm = confirmText === "RESET" && !isResetting;

  async function handleConfirm() {
    if (!canConfirm) {
      return;
    }

    setIsResetting(true);
    setError("");

    try {
      await onReset();
      setSuccess("Data reset completed.");
      setIsOpen(false);
      setConfirmText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset data.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-red-500/35 bg-red-500/10 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-semibold text-red-200">Danger Zone</h2>
      <p className="mt-1 text-sm text-red-100/85">This action cannot be undone.</p>

      <div className="mt-4">
        <button
          className="h-11 rounded-xl bg-red-500/80 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            setError("");
            setIsOpen(true);
          }}
          type="button"
        >
          Reset Data
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-emerald-200">{success}</p> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            aria-label="Close reset modal"
            className="absolute inset-0 bg-black/55"
            onClick={() => {
              if (!isResetting) {
                setIsOpen(false);
              }
            }}
            type="button"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-500/30 bg-[#1d1416] p-5 shadow-2xl shadow-black/50">
            <h3 className="text-lg font-semibold text-red-100">Confirm Reset Data</h3>
            <p className="mt-2 text-sm text-red-100/85">
              Type <span className="font-semibold text-white">RESET</span> to continue.
            </p>

            <input
              className="mt-4 h-11 w-full rounded-xl border border-red-400/30 bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-red-300/70 focus:ring-2 focus:ring-red-400/30"
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Type RESET"
              value={confirmText}
            />

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className="h-11 rounded-xl border border-white/15 px-4 text-sm font-medium text-white/85"
                onClick={() => {
                  if (!isResetting) {
                    setIsOpen(false);
                  }
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="h-11 rounded-xl bg-red-500/90 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canConfirm}
                onClick={handleConfirm}
                type="button"
              >
                {isResetting ? "Resetting..." : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
