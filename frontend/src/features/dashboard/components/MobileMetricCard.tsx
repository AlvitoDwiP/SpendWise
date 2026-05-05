"use client";

import { type LucideIcon } from "lucide-react";

import { formatCompactRupiah } from "@/lib/format";

type MobileMetricCardProps = {
  amountClassName: string;
  accentClassName: string;
  borderClassName?: string;
  bars: number[];
  icon: LucideIcon;
  label: string;
  sublabel: string;
  value: number;
  valueFormatter?: (value: number) => string;
  valuePrefix?: string;
};

export function MobileMetricCard({
  amountClassName,
  accentClassName,
  borderClassName = "border-white/10",
  bars,
  icon: Icon,
  label,
  sublabel,
  value,
  valueFormatter,
  valuePrefix,
}: MobileMetricCardProps) {
  const peak = Math.max(...bars, 1);
  const resolvedValue = valueFormatter
    ? valueFormatter(value)
    : valuePrefix
      ? `${valuePrefix}${formatCompactRupiah(value)}`
      : formatCompactRupiah(value);

  return (
    <article className={`min-h-[184px] rounded-[24px] border bg-[var(--surface-base)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${borderClassName}`}>
      <div className="flex items-start gap-3">
        <div className={`grid h-12 w-12 place-items-center rounded-[14px] border ${borderClassName} ${accentClassName}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>

      <p className="mt-4 font-sans text-[16px] font-semibold leading-6 text-[var(--text-primary)]">{label}</p>
      <p
        className={`mt-2.5 min-w-0 text-[clamp(1.7rem,7vw,1.95rem)] font-semibold leading-[1.08] tracking-[-0.03em] ${amountClassName}`}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {resolvedValue}
      </p>
      <p className="mt-2 font-sans text-[13px] font-medium leading-5 text-[var(--text-secondary)]">{sublabel}</p>

      <div className="mt-5 flex h-12 items-end gap-1.5">
        {bars.map((bar, index) => {
          const height = peak > 0 ? Math.max((bar / peak) * 100, 18) : 18;

          return (
            <span
              className={`block flex-1 rounded-full ${accentClassName}`}
              key={`${label}-${index}`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </article>
  );
}
