import { getMe } from "@/features/settings/api";
import { getToken, removeToken } from "@/lib/api/client";
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
