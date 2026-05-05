import type { ApiErrorResponse } from "@/types/api.types";

const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_STORAGE_KEY = "spendwise_token";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname.endsWith(".devtunnels.ms")) {
      const backendHost = hostname.replace(/-3000(\.|$)/, "-8080$1");
      return `${protocol}//${backendHost}`;
    }
  }

  return "http://localhost:8080";
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body && !isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function withQuery(path: string, params: QueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  if (!query) {
    return path;
  }

  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
}

export async function getErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const error = (await response.json()) as Partial<ApiErrorResponse>;
    return error.message || fallback;
  } catch {
    return fallback;
  }
}
