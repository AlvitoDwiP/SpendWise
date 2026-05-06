"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type SettingsDangerZoneProps = {
  onDeleteAccount: () => Promise<void>;
  onReset: () => Promise<void>;
};

type DangerModal = "delete" | "reset" | null;

export function SettingsDangerZone({
  onDeleteAccount,
  onReset,
}: SettingsDangerZoneProps) {
  const [activeModal, setActiveModal] = useState<DangerModal>(null);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [success, setSuccess] = useState("");

  const canReset = resetConfirmText === "RESET" && !isResetting;
  const canDelete = deleteConfirmText === "DELETE" && !isDeleting;
  const isBusy = isResetting || isDeleting;

  function closeModal() {
    if (isBusy) {
      return;
    }

    setActiveModal(null);
    setModalError("");
    setResetConfirmText("");
    setDeleteConfirmText("");
  }

  async function handleConfirm() {
    if (!canReset) {
      return;
    }

    setIsResetting(true);
    setModalError("");

    try {
      await onReset();
      setSuccess("Data reset completed.");
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to reset data.");
    } finally {
      setIsResetting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!canDelete) {
      return;
    }

    setIsDeleting(true);
    setModalError("");
    setSuccess("");

    try {
      await onDeleteAccount();
      closeModal();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="state-card state-card-danger sm:p-6">
      <p className="page-label text-[var(--accent-red)]">Danger Zone</p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--accent-red)]">Danger Zone</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>

      <div className="danger-actions mt-4 flex flex-col items-start gap-3">
        <button
          className="inline-flex h-[46px] w-fit items-center justify-center rounded-[18px] border border-[rgba(216,124,124,0.30)] bg-[rgba(216,124,124,0.10)] px-5 font-sans text-[15px] font-bold leading-none text-[var(--accent-red)] transition-colors hover:border-[rgba(216,124,124,0.38)] hover:bg-[rgba(216,124,124,0.14)] active:bg-[rgba(216,124,124,0.18)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(216,124,124,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            setModalError("");
            setSuccess("");
            setActiveModal("reset");
            setResetConfirmText("");
          }}
          type="button"
        >
          Reset Data
        </button>
        <button
          className="inline-flex h-[46px] w-fit items-center justify-center rounded-[18px] border border-[rgba(216,124,124,0.32)] bg-[rgba(216,124,124,0.12)] px-5 font-sans text-[15px] font-bold leading-none text-[var(--accent-red)] no-underline transition-colors hover:border-[rgba(216,124,124,0.42)] hover:bg-[rgba(216,124,124,0.18)] active:bg-[rgba(216,124,124,0.22)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(216,124,124,0.14)] disabled:cursor-not-allowed disabled:opacity-65"
          onClick={() => {
            setModalError("");
            setSuccess("");
            setActiveModal("delete");
            setDeleteConfirmText("");
          }}
          type="button"
        >
          Delete Account
        </button>
      </div>

      {success ? <p className="alert-success mt-3">{success}</p> : null}

      <AnimatePresence>
        {activeModal ? (
          <div className="fixed inset-0 z-[120]">
            <motion.button
              aria-label="Close danger zone modal"
              className="fixed inset-0 bg-[rgba(0,0,0,0.50)] backdrop-blur-[12px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              type="button"
            />
            <motion.section
              aria-modal="true"
              className="fixed left-1/2 top-1/2 z-10 w-[calc(100vw-32px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-[var(--border-muted)] bg-[linear-gradient(180deg,rgba(36,31,26,0.98),rgba(33,29,24,1))] p-7 text-[var(--text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:p-8"
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.97 }}
              role="dialog"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[rgba(216,124,124,0.32)] bg-[rgba(216,124,124,0.12)] text-[var(--accent-red)]">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <p className="page-label text-[var(--accent-red)]">Danger Zone</p>
                  <h3 className="mt-2 font-sans text-[26px] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--text-primary)]">
                    {activeModal === "delete" ? "Delete account?" : "Confirm Reset Data"}
                  </h3>
                  <p className="mt-2 text-[15px] leading-6 text-[var(--text-secondary)]">
                    {activeModal === "delete"
                      ? "Your account and all related data will be deleted. This action cannot be undone."
                      : "Type RESET to continue."}
                  </p>
                </div>
              </div>

              {activeModal === "reset" ? (
                <input
                  className="mt-5 h-[54px] w-full rounded-[18px] border border-[var(--border-muted)] bg-[var(--surface-input)] px-[18px] font-sans text-[15px] text-[var(--text-primary)] outline-none transition focus:border-[var(--border-active)] focus:shadow-[0_0_0_3px_rgba(216,124,124,0.12)]"
                  disabled={isResetting}
                  onChange={(event) => setResetConfirmText(event.target.value)}
                  placeholder="Type RESET"
                  value={resetConfirmText}
                />
              ) : (
                <input
                  className="mt-5 h-[54px] w-full rounded-[18px] border border-[var(--border-muted)] bg-[var(--surface-input)] px-[18px] font-sans text-[15px] text-[var(--text-primary)] outline-none transition focus:border-[var(--border-active)] focus:shadow-[0_0_0_3px_rgba(216,124,124,0.12)]"
                  disabled={isDeleting}
                  onChange={(event) => setDeleteConfirmText(event.target.value)}
                  placeholder="Type DELETE"
                  value={deleteConfirmText}
                />
              )}

              {modalError ? (
                <p className="mt-4 rounded-[14px] border border-[rgba(216,124,124,0.26)] bg-[rgba(216,124,124,0.10)] px-[14px] py-3 text-[13px] leading-6 text-[var(--accent-red)]">
                  {modalError}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  className="inline-flex h-[46px] items-center justify-center rounded-[18px] border border-[var(--border-muted)] bg-[var(--surface-raised)] px-5 font-sans text-[15px] font-bold leading-none text-[var(--accent-cream)] transition-colors hover:bg-[rgba(41,35,29,0.95)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(237,226,200,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isBusy}
                  onClick={closeModal}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-[46px] items-center justify-center rounded-[18px] border border-[rgba(216,124,124,0.34)] bg-[rgba(216,124,124,0.16)] px-5 font-sans text-[15px] font-bold leading-none text-[var(--accent-red)] transition-colors hover:bg-[rgba(216,124,124,0.2)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(216,124,124,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={activeModal === "reset" ? !canReset : !canDelete}
                  onClick={activeModal === "delete" ? handleDeleteAccount : handleConfirm}
                  type="button"
                >
                  {activeModal === "delete"
                    ? isDeleting
                      ? "Deleting..."
                      : "Delete Account"
                    : isResetting
                      ? "Resetting..."
                      : "Confirm Reset"}
                </button>
              </div>
            </motion.section>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
