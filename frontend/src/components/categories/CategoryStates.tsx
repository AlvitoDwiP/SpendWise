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
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
          key={index}
        >
          <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryEmptyState({ onAddClick }: CategoryEmptyStateProps) {
  return (
    <motion.section
      className="rounded-3xl border border-dashed border-purple-300/20 bg-white/[0.045] p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-purple-500/15 text-purple-300">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-white">
        No categories yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">
        Create income and expense categories so every transaction can be grouped
        clearly.
      </p>
      <button
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02] active:scale-[0.98]"
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
      className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-red-500/15 text-red-300">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-red-100">Categories unavailable</p>
            <p className="mt-1 text-sm leading-6 text-red-100/65">{message}</p>
          </div>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
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
