"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";

type SettingsProfileSectionProps = {
  initialName: string;
  onSave: (payload: {
    name: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
};

export function SettingsProfileSection({ initialName, onSave }: SettingsProfileSectionProps) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const validationMessage = useMemo(() => {
    if (!name.trim()) {
      return "Name is required.";
    }

    const hasAnyPassword =
      currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

    if (!hasAnyPassword) {
      return "";
    }

    if (!currentPassword) {
      return "Current password is required.";
    }

    if (newPassword.length < 6) {
      return "New password must be at least 6 characters.";
    }

    if (confirmPassword !== newPassword) {
      return "Confirm password must match new password.";
    }

    return "";
  }, [confirmPassword, currentPassword, name, newPassword]);

  const canSubmit = !isSaving && !validationMessage;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError(validationMessage || "Please check your input.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await onSave({
        name: name.trim(),
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess("Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#1c1c1e]/90 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <h2 className="text-xl font-semibold text-white">Profile</h2>
      <p className="mt-1 text-sm text-white/55">Update your name and account password.</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <Field label="Name">
          <input
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            type="text"
            value={name}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Current Password">
            <input
              autoComplete="current-password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Current password"
              type="password"
              value={currentPassword}
            />
          </Field>

          <Field label="New Password">
            <input
              autoComplete="new-password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 6 characters"
              type="password"
              value={newPassword}
            />
          </Field>
        </div>

        <Field label="Confirm New Password">
          <input
            autoComplete="new-password"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20"
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat new password"
            type="password"
            value={confirmPassword}
          />
        </Field>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
        {!error && validationMessage ? <p className="text-sm text-amber-300">{validationMessage}</p> : null}

        <button
          className="h-11 w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-36"
          disabled={!canSubmit}
          type="submit"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      {children}
    </label>
  );
}
