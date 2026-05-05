"use client";

export function TransactionLoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="skeleton-warm h-[88px] rounded-[22px] border border-[var(--border-muted)]"
        />
      ))}
    </div>
  );
}
