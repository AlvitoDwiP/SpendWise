import { getMe, getToken, removeToken, type User } from "./api";

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
