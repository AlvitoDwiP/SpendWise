"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { DashboardBackground } from "../../components/dashboard/DashboardBackground";
import { DashboardDrawer } from "../../components/dashboard/DashboardDrawer";
import { DashboardNavbar } from "../../components/dashboard/DashboardNavbar";
import { DashboardSidebarCard } from "../../components/dashboard/DashboardSidebarCard";
import { MobileBottomNav } from "../../components/dashboard/MobileBottomNav";
import { SettingsDangerZone } from "../../components/settings/SettingsDangerZone";
import { SettingsProfileSection } from "../../components/settings/SettingsProfileSection";
import {
  SettingsErrorState,
  SettingsLoadingState,
} from "../../components/settings/SettingsStates";
import {
  changePassword,
  getMe,
  getToken,
  resetUserData,
  type User,
  updateProfile,
} from "../../lib/api";
import { logout } from "../../lib/auth";

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
        const profile = await getMe();

        if (isMounted) {
          setUser(profile);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load settings.";

        if (isAuthError(message)) {
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
    router.replace("/login");
  }

  async function handleSaveProfile(payload: {
    name: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const profile = await updateProfile({ name: payload.name });
    setUser(profile);

    if (payload.newPassword) {
      await changePassword({
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
      });
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

  return (
    <main className="relative min-h-screen w-full max-w-full overflow-x-clip bg-[#0f0f10] text-white">
      <DashboardBackground />

      <div className="relative flex min-h-screen">
        {isSidebarOpen ? (
          <div className="hidden md:block md:pb-12 md:pl-8 md:pt-0">
            <DashboardSidebarCard onLogout={handleLogout} />
          </div>
        ) : null}

        <div className="relative mx-auto w-full max-w-full flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+6.6rem)] pt-2.5 md:px-8 md:pb-12 md:pt-0">
          <DashboardNavbar
            dateLabel="Settings"
            greeting={getGreeting()}
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
            userName={user.name}
          />

          <div className="mx-auto max-w-3xl space-y-6">
            <section>
              <Link
                className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/55 transition hover:text-purple-300"
                href="/dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
              <h1 className="text-2xl font-semibold text-white md:text-3xl">Settings</h1>
              <p className="mt-1 text-sm text-white/60 md:text-base">
                Manage profile and account safety.
              </p>
            </section>

            <SettingsProfileSection initialName={user.name} onSave={handleSaveProfile} />

            <div className="pt-2 md:pt-3">
              <SettingsDangerZone onReset={handleResetData} />
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

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }
  if (hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function isAuthError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("401") ||
    normalizedMessage.includes("403") ||
    normalizedMessage.includes("authorization") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("token")
  );
}
