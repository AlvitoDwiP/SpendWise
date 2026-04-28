"use client";

export function TransactionLoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-xl bg-gradient-to-r from-slate-700/30 to-slate-700/50 animate-pulse"
        />
      ))}
    </div>
  );
}

export function TransactionPaginationLoadingState() {
  return (
    <div className="h-16 rounded-xl bg-gradient-to-r from-slate-700/30 to-slate-700/50 animate-pulse" />
  );
}
