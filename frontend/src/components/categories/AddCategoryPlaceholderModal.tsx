"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type AddCategoryPlaceholderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AddCategoryPlaceholderModal({
  isOpen,
  onClose,
}: AddCategoryPlaceholderModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end px-4 pb-4 sm:place-items-center sm:p-6">
          <motion.button
            aria-label="Close add category modal"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            type="button"
          />
          <motion.section
            aria-modal="true"
            className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1c1c1e]/95 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            role="dialog"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Add Category</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Category creation is not available from this screen yet. Your
                  current category list stays ready here.
                </p>
              </div>
              <button
                aria-label="Close modal"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.98]"
              onClick={onClose}
              type="button"
            >
              Got it
            </button>
          </motion.section>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
