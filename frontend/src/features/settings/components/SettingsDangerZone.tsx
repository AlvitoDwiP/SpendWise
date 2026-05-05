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
    <section className="state-card state-card-danger sm:p-6">
      <p className="page-label text-[var(--accent-red)]">Danger Zone</p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--accent-red)]">Danger Zone</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>

      <div className="mt-4">
        <button
          className="btn-base btn-danger disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            setError("");
            setIsOpen(true);
          }}
          type="button"
        >
          Reset Data
        </button>
      </div>

      {error ? <p className="alert-error mt-3">{error}</p> : null}
      {success ? <p className="alert-success mt-3">{success}</p> : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            aria-label="Close reset modal"
            className="modal-overlay"
            onClick={() => {
              if (!isResetting) {
                setIsOpen(false);
              }
            }}
            type="button"
          />
          <div className="modal-panel relative z-10 max-w-md">
            <div className="modal-handle" />
            <h3 className="text-lg font-semibold text-[var(--accent-red)]">Confirm Reset Data</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Type <span className="font-semibold text-white">RESET</span> to continue.
            </p>

            <input
              className="input-base mt-4 border-[rgba(216,124,124,0.28)]"
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Type RESET"
              value={confirmText}
            />

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                className="btn-base btn-secondary"
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
                className="btn-base btn-danger disabled:cursor-not-allowed disabled:opacity-50"
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
