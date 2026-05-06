"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { DashboardBackground } from "@/features/dashboard/components/DashboardBackground";
import { DashboardDrawer } from "@/components/layout/DashboardDrawer";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { DashboardSidebarCard } from "@/components/layout/DashboardSidebarCard";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SettingsDangerZone } from "@/features/settings/components/SettingsDangerZone";
import { SettingsProfileSection } from "@/features/settings/components/SettingsProfileSection";
import {
  SettingsErrorState,
  SettingsLoadingState,
} from "@/features/settings/components/SettingsStates";
import {
  changePassword,
  deleteAccount,
  resetUserData,
  uploadProfilePhoto,
  updateProfile,
} from "@/features/settings/api";
import { buildUrl, getToken } from "@/lib/api/client";
import { getErrorMessage, getCurrentUser, isUnauthorizedError, logout } from "@/lib/auth";
import { getGreetingByTime } from "@/lib/format";
import type { User } from "@/types/user.types";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const profile = await getCurrentUser();

        if (!profile) {
          logout();
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setUser(profile);
        }
      } catch (err) {
        const message = getErrorMessage(err, "Failed to load settings.");

        if (isUnauthorizedError(err)) {
          logout();
          router.replace("/login");
          return;
        }

        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function handleLogout() {
    logout();
    setIsDrawerOpen(false);
    router.replace("/dashboard");
  }

  async function handleSaveProfile(payload: {
    name: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ nameUpdated: boolean; passwordChanged: boolean }> {
    if (!user) {
      throw new Error("User profile is not ready yet.");
    }

    const trimmedName = payload.name.trim();
    const isNameChanged = trimmedName !== user.name.trim();
    const hasAnyPassword =
      payload.currentPassword.length > 0 ||
      payload.newPassword.length > 0 ||
      payload.confirmPassword.length > 0;

    if (!isNameChanged && !hasAnyPassword) {
      throw new Error("No profile changes to save.");
    }

    let nextUser = user;
    let nameUpdated = false;
    let passwordChanged = false;

    if (isNameChanged) {
      try {
        nextUser = await updateProfile({ name: trimmedName });
        setUser(nextUser);
        nameUpdated = true;
      } catch (err) {
        throw new Error(
          err instanceof Error ? `Failed to update name: ${err.message}` : "Failed to update name.",
        );
      }
    }

    if (hasAnyPassword) {
      try {
        await changePassword({
          current_password: payload.currentPassword,
          new_password: payload.newPassword,
        });
        passwordChanged = true;
      } catch (err) {
        setUser(nextUser);
        throw new Error(
          err instanceof Error
            ? `Name saved, but failed to change password: ${err.message}`
            : "Name saved, but failed to change password.",
        );
      }
    }

    return {
      nameUpdated,
      passwordChanged,
    };
  }

  async function handleSavePhoto(file: File): Promise<void> {
    try {
      const updatedUser = await uploadProfilePhoto(file);
      setUser(updatedUser);
    } catch (err) {
      const message =
        getErrorMessage(err, "Failed to upload profile photo.");

      if (isUnauthorizedError(err)) {
        logout();
        router.replace("/login");
        throw new Error(message);
      }

      throw err;
    }
  }

  async function handleResetData(): Promise<void> {
    try {
      await resetUserData();
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset data.";
      const normalized = message.toLowerCase();

      if (normalized.includes("404") || normalized.includes("not found")) {
        throw new Error("Reset data is not available yet.");
      }

      throw err;
    }
  }

  async function handleDeleteAccount(): Promise<void> {
    try {
      await deleteAccount();
      logout();
      router.replace("/dashboard");
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error("Failed to delete account. Please try again.");
    }
  }

  if (isLoading) {
    return <SettingsLoadingState />;
  }

  if (error || !user) {
    return (
      <SettingsErrorState
        message={error || "Unable to load settings data."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const resolvedProfilePhotoUrl = user.profile_photo_url
    ? buildUrl(user.profile_photo_url)
    : null;

  return (
    <main className="app-shell w-full max-w-full">
      <DashboardBackground />

      <div className="relative flex min-h-screen">
        {isSidebarOpen ? (
          <div className="hidden md:block md:pb-12 md:pl-8 md:pt-0">
            <DashboardSidebarCard onLogout={handleLogout} />
          </div>
        ) : null}

        <div className="relative mx-auto w-full max-w-full flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+6.6rem)] pt-2.5 md:px-8 md:pb-12 md:pt-0">
          <DashboardNavbar
            greeting={getGreetingByTime()}
            isSidebarOpen={isSidebarOpen}
            onAddTransaction={() => router.push("/transactions")}
            onMenuClick={() => {
              const mediaQuery = window.matchMedia("(min-width: 768px)");
              if (mediaQuery.matches) {
                setIsSidebarOpen((current) => !current);
              } else {
                setIsDrawerOpen(true);
              }
            }}
            profilePhotoUrl={resolvedProfilePhotoUrl}
            userName={user.name}
          />

          <div className="app-desktop-page max-w-3xl space-y-6">
            <section>
              <Link
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--accent-cream)]"
                href="/dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
              <p className="page-label">More</p>
              <h1 className="page-title mt-3 md:text-[46px]">Settings</h1>
              <p className="page-subtitle mt-3 md:text-base">
                Manage profile and account safety.
              </p>
            </section>

            <SettingsProfileSection
              key={`${user.id}-${user.name}-${user.profile_photo_url ?? ""}`}
              initialName={user.name}
              initialProfilePhotoUrl={resolvedProfilePhotoUrl}
              onSavePhoto={handleSavePhoto}
              onSaveProfile={handleSaveProfile}
            />

            <div className="pt-2 md:pt-3">
              <SettingsDangerZone onDeleteAccount={handleDeleteAccount} onReset={handleResetData} />
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav
        onAddTransaction={() => router.push("/transactions")}
        onLogout={handleLogout}
      />

      <DashboardDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogout={handleLogout}
      />
    </main>
  );
}
