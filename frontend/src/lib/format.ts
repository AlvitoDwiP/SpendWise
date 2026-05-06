export function formatCurrencyIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\s/g, " ");
}

export function formatRupiah(value: number): string {
  return formatCurrencyIDR(value);
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

export function formatMonthYear(
  value: string | Date,
  locale: string = "en",
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(typeof value === "string" ? new Date(value) : value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
    notation: "compact",
  })
    .format(value)
    .replace(/\s/g, "");
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

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
    style: "percent",
  }).format(value / 100);
}

export function getGreetingByTime(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good Morning";
  }
  if (hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

export function normalizeTransactionType(value: string): "income" | "expense" | null {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "income" || normalizedValue === "expense") {
    return normalizedValue;
  }

  return null;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1,
  }).format(value);
}
