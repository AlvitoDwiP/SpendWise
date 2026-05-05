"use client";

import { useState } from "react";

type MobileDashboardHeaderProps = {
  greeting: string;
  profilePhotoUrl?: string | null;
  userName: string;
};

export function MobileDashboardHeader({
  greeting,
  profilePhotoUrl,
  userName,
}: MobileDashboardHeaderProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const showProfilePhoto = Boolean(profilePhotoUrl) && !hasImageError;

  return (
    <section className="md:hidden">
      <div className="flex items-start justify-between gap-4 px-7 pt-[calc(env(safe-area-inset-top)+1.2rem)]">
        <div className="min-w-0">
          <p className="font-sans text-[14px] font-semibold uppercase leading-5 tracking-[0.28em] text-[var(--text-secondary)]">
            Dashboard
          </p>
          <h1
            className="mt-4 text-[clamp(2.7rem,10vw,3rem)] leading-[1.1] tracking-[-0.045em] text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {greeting}, {userName}
          </h1>
          <p className="mt-3 max-w-[18rem] font-sans text-[16px] leading-6 text-[var(--text-secondary)]">
            Take full control of your financial future.
          </p>
        </div>

        <div className="relative z-10 grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border-muted)] bg-[var(--surface-base)] text-sm font-semibold tracking-[0.08em] text-[#b8ab9a] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          {showProfilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`${userName} profile`}
              className="h-full w-full object-cover"
              onError={() => setHasImageError(true)}
              src={profilePhotoUrl ?? undefined}
            />
          ) : (
            getInitial(userName)
          )}
        </div>
      </div>
    </section>
  );
}

function getInitial(value: string): string {
  const compact = value.replace(/\s+/g, "").toUpperCase();
  return compact.slice(0, 2) || "SW";
}
