"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type SettingsProfileSectionProps = {
  initialName: string;
  initialProfilePhotoUrl?: string | null;
  onSaveProfile: (payload: {
    name: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{
    nameUpdated: boolean;
    passwordChanged: boolean;
  }>;
  onSavePhoto: (file: File) => Promise<void>;
};

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PHOTO_SUCCESS_MESSAGE = "Profile photo updated successfully.";
const DISPLAY_NAME_SUCCESS_MESSAGE = "Display name updated successfully.";
const PASSWORD_SUCCESS_MESSAGE = "Password changed successfully.";

export function SettingsProfileSection({
  initialName,
  initialProfilePhotoUrl,
  onSavePhoto,
  onSaveProfile,
}: SettingsProfileSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const selectedPhotoPreviewUrl = useMemo(() => {
    if (!selectedPhotoFile) {
      return "";
    }
    return URL.createObjectURL(selectedPhotoFile);
  }, [selectedPhotoFile]);

  useEffect(() => {
    return () => {
      if (selectedPhotoPreviewUrl) {
        URL.revokeObjectURL(selectedPhotoPreviewUrl);
      }
    };
  }, [selectedPhotoPreviewUrl]);

  const isNameChanged = useMemo(
    () => name.trim() !== initialName.trim(),
    [initialName, name],
  );

  const hasAnyPassword = useMemo(
    () => currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0,
    [confirmPassword, currentPassword, newPassword],
  );

  const validationMessage = useMemo(() => {
    if (!name.trim()) {
      return "Name is required.";
    }

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
  }, [confirmPassword, currentPassword, hasAnyPassword, name, newPassword]);

  const hasMeaningfulChange = isNameChanged || hasAnyPassword;
  const canSubmitProfile =
    !isProfileSaving && hasMeaningfulChange && !validationMessage;
  const canSavePhoto = !!selectedPhotoFile && !isUploadingPhoto;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmitProfile) {
      setProfileError(validationMessage || "Please check your input.");
      return;
    }

    setIsProfileSaving(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const result = await onSaveProfile({
        name: name.trim(),
        currentPassword,
        newPassword,
        confirmPassword,
      });

      const successMessages = [
        result.nameUpdated ? DISPLAY_NAME_SUCCESS_MESSAGE : "",
        result.passwordChanged ? PASSWORD_SUCCESS_MESSAGE : "",
      ].filter(Boolean);

      if (successMessages.length > 0) {
        const successMessage = successMessages.join(" ");
        setProfileSuccess(successMessage);
        window.alert(successMessage);
      }

      if (result.passwordChanged) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsProfileSaving(false);
    }
  }

  function handleSelectPhoto(event: FormEvent<HTMLInputElement>) {
    const target = event.currentTarget;
    const file = target.files?.[0];

    setPhotoError("");
    setPhotoSuccess("");

    if (!file) {
      setSelectedPhotoFile(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setSelectedPhotoFile(null);
      setPhotoError("Only JPG, JPEG, PNG, and WEBP files are allowed.");
      target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setSelectedPhotoFile(null);
      setPhotoError("Photo must be 2MB or smaller.");
      target.value = "";
      return;
    }

    setSelectedPhotoFile(file);
  }

  async function handleSavePhoto() {
    if (!selectedPhotoFile) {
      setPhotoError("Please choose a photo first.");
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError("");
    setPhotoSuccess("");

    try {
      await onSavePhoto(selectedPhotoFile);
      setPhotoSuccess(PHOTO_SUCCESS_MESSAGE);
      window.alert(PHOTO_SUCCESS_MESSAGE);
      setSelectedPhotoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to upload profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  const displayPhoto = selectedPhotoPreviewUrl || initialProfilePhotoUrl || "";

  return (
    <section className="warm-panel app-card-pad sm:p-6">
      <p className="page-label">Profile</p>
      <h2 className="mt-3 text-[34px] leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)]" style={{ fontFamily: "var(--font-serif)" }}>Profile</h2>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        Manage your photo, name, and account password.
      </p>

      <div className="warm-elevated mt-5 p-4">
        <p className="field-label">Profile Photo</p>
        <div className="mt-3 flex flex-col items-start gap-4">
          <div className="avatar-shell grid h-20 w-20 place-items-center text-xl font-semibold text-[var(--text-primary)]">
            {displayPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`${name} profile`} className="h-full w-full object-cover" src={displayPhoto} />
            ) : (
              getInitial(name)
            )}
          </div>

          <div className="w-full">
            <input
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleSelectPhoto}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="btn-base btn-secondary min-h-[42px] rounded-[16px] px-4"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Change Photo
            </button>
            <button
              className="btn-base btn-primary ml-2 min-h-[42px] rounded-[16px] px-4 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!canSavePhoto}
              onClick={handleSavePhoto}
              type="button"
            >
              {isUploadingPhoto ? "Saving photo..." : "Save Photo"}
            </button>
            <p className="mt-2 text-xs text-[var(--text-muted)]">Allowed: JPG, JPEG, PNG, WEBP. Max 2MB.</p>
            {photoError ? <p className="alert-error mt-2">{photoError}</p> : null}
            {photoSuccess ? <p className="alert-success mt-2">{photoSuccess}</p> : null}
            {!photoError && !photoSuccess && !selectedPhotoFile ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">No profile photo changes yet.</p>
            ) : null}
          </div>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <div className="warm-elevated p-4">
          <p className="field-label">Name</p>
          <Field label="Display Name">
            <input
              className="input-base"
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              type="text"
              value={name}
            />
          </Field>
        </div>

        <div className="warm-elevated p-4">
          <p className="field-label">Change Password</p>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Current Password">
              <input
                autoComplete="current-password"
                className="input-base"
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Current password"
                type="password"
                value={currentPassword}
              />
            </Field>

            <Field label="New Password">
              <input
                autoComplete="new-password"
                className="input-base"
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 6 characters"
                type="password"
                value={newPassword}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Confirm New Password">
              <input
                autoComplete="new-password"
                className="input-base"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat new password"
                type="password"
                value={confirmPassword}
              />
            </Field>
          </div>
        </div>

        {profileError ? <p className="alert-error">{profileError}</p> : null}
        {profileSuccess ? <p className="alert-success">{profileSuccess}</p> : null}
        {!profileError && validationMessage ? <p className="alert-warning">{validationMessage}</p> : null}
        {!profileError && !validationMessage && !hasMeaningfulChange ? (
          <p className="text-sm text-[var(--text-muted)]">No profile changes yet.</p>
        ) : null}

        <button
          className="btn-base btn-primary w-full sm:w-auto sm:min-w-36"
          disabled={!canSubmitProfile}
          type="submit"
        >
          {isProfileSaving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || "S";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-3 block space-y-2 first:mt-0">
      <span className="field-label mb-0">{label}</span>
      {children}
    </label>
  );
}
