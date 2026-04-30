"use client";

import { Camera, Upload } from "lucide-react";

import { ReceiptPreview } from "./ReceiptPreview";

type ReceiptUploadStepProps = {
  disabled?: boolean;
  imageUrl: string;
  isScanning: boolean;
  onFileChange: (file: File | null) => void;
  onRemoveImage: () => void;
  onScan: () => void;
};

export function ReceiptUploadStep({
  disabled = false,
  imageUrl,
  isScanning,
  onFileChange,
  onRemoveImage,
  onScan,
}: ReceiptUploadStepProps) {
  return (
    <div className="space-y-4">
      {imageUrl ? <ReceiptPreview imageUrl={imageUrl} onRemove={onRemoveImage} /> : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
          <Upload className="h-4 w-4" />
          Upload Image
          <input
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>

        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">
          <Camera className="h-4 w-4" />
          Take Photo
          <input
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={disabled}
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
      </div>

      <button
        className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || !imageUrl || isScanning}
        onClick={onScan}
        type="button"
      >
        {isScanning ? "Scanning..." : "Scan Receipt"}
      </button>
    </div>
  );
}
