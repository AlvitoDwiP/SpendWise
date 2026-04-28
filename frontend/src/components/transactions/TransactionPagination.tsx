"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TransactionPaginationProps {
  limit: number;
  offset: number;
  total: number;
  onPreviousClick: () => void;
  onNextClick: () => void;
}

export function TransactionPagination({
  limit,
  offset,
  total,
  onPreviousClick,
  onNextClick,
}: TransactionPaginationProps) {
  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const isPreviousDisabled = offset === 0;
  const isNextDisabled = offset + limit >= total;

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:flex-row">
      <p className="text-sm text-slate-400">
        Showing{" "}
        <span className="font-medium text-white">
          {start}-{end}
        </span>{" "}
        of{" "}
        <span className="font-medium text-white">{total}</span>
      </p>

      <div className="flex gap-2">
        <button
          onClick={onPreviousClick}
          disabled={isPreviousDisabled}
          className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-slate-600/50"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <button
          onClick={onNextClick}
          disabled={isNextDisabled}
          className="flex items-center gap-2 rounded-lg bg-slate-700/50 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-slate-600/50"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
