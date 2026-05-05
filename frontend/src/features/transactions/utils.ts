export function isValidDate(value: Date | null | undefined): value is Date {
  return !!value && !Number.isNaN(value.getTime());
}

export function parseTransactionDate(value?: string | Date | null): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  const parsed = new Date(value);
  return isValidDate(parsed) ? parsed : null;
}

export function toRFC3339(date: Date): string {
  return date.toISOString();
}
