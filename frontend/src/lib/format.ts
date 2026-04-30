export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, " ");
}

export function formatRupiahNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseRupiahInput(value: string): number | null {
  const digitsOnly = value.replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return null;
  }

  const parsed = Number(digitsOnly);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatCompactRupiah(value: number): string {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 1_000_000) {
    return `${formatNumber(value / 1_000_000)}M`;
  }
  if (absoluteValue >= 1_000) {
    return `${formatNumber(value / 1_000)}K`;
  }

  return String(value);
}

export function formatTransactionDate(value: string): string {
  return formatDate(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(value);
}
