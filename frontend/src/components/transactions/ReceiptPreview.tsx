"use client";

import Image from "next/image";

type ReceiptPreviewProps = {
  imageUrl: string;
  onRemove: () => void;
};

export function ReceiptPreview({ imageUrl, onRemove }: ReceiptPreviewProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <Image
        alt="Receipt preview"
        className="h-44 w-full rounded-xl object-cover"
        height={176}
        unoptimized
        src={imageUrl}
        width={420}
      />
      <button
        className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        onClick={onRemove}
        type="button"
      >
        Remove Image
      </button>
    </div>
  );
}
