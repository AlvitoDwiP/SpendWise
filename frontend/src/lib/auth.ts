import { getMe } from "@/features/settings/api";
import { ApiClientError, getToken, removeToken } from "@/lib/api/client";
import type { User } from "@/types/user.types";

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function logout(): void {
  removeToken();
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isAuthenticated()) {
    return null;
  }

  try {
    return await getMe();
  } catch {
    removeToken();
    return null;
  }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.status === 401 || error.status === 403;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedMessage = error.message.toLowerCase();
  return (
    normalizedMessage.includes("401") ||
    normalizedMessage.includes("403") ||
    normalizedMessage.includes("authorization") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("token")
  );
}
