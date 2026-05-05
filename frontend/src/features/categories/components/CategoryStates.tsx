"use client";

import { AlertCircle, FolderOpen, Plus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

type CategoryEmptyStateProps = {
  onAddClick: () => void;
};

type CategoryErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function CategoryLoadingState() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="list-item flex items-center gap-4"
          key={index}
        >
          <div className="skeleton-warm h-14 w-14 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <div className="skeleton-warm h-4 w-2/3 rounded-full" />
            <div className="skeleton-warm h-3 w-1/2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryEmptyState({ onAddClick }: CategoryEmptyStateProps) {
  return (
    <motion.section
      className="state-card text-center"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[var(--border-muted)] bg-[var(--accent-purple-soft)] text-[var(--accent-purple)]">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-[var(--text-primary)]">
        No categories yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">
        Create income and expense categories so every transaction can be grouped
        clearly.
      </p>
      <button
        className="btn-base btn-primary mt-6"
        onClick={onAddClick}
        type="button"
      >
        <Plus className="h-4 w-4" />
        Add Category
      </button>
    </motion.section>
  );
}

export function CategoryErrorState({
  message,
  onRetry,
}: CategoryErrorStateProps) {
  return (
    <motion.section
      className="state-card state-card-danger"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[rgba(216,124,124,0.28)] bg-[var(--accent-red-soft)] text-[var(--accent-red)]">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-[var(--accent-red)]">Categories unavailable</p>
            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
          </div>
        </div>
        <button
          className="btn-base btn-secondary"
          onClick={onRetry}
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </motion.section>
  );
}
