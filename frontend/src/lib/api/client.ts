import type { ApiErrorResponse } from "@/types/api.types";

const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_STORAGE_KEY = "spendwise_token";

type QueryParams = Record<string, string | number | boolean | null | undefined>;
type RequestBody = BodyInit | null | undefined;

export class ApiClientError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

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
  return apiClient.request<T>(path, options);
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
    const error = await parseJsonSafely<Partial<ApiErrorResponse>>(response);
    return (
      error?.error?.message ||
      error?.message ||
      fallback
    );
  } catch {
    return fallback;
  }
}

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestInit, "method">): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<RequestInit, "method" | "body">,
  ): Promise<TResponse> {
    return request<TResponse>(path, {
      ...options,
      body: serializeBody(body),
      method: "POST",
    });
  },
  put<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<RequestInit, "method" | "body">,
  ): Promise<TResponse> {
    return request<TResponse>(path, {
      ...options,
      body: serializeBody(body),
      method: "PUT",
    });
  },
  patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<RequestInit, "method" | "body">,
  ): Promise<TResponse> {
    return request<TResponse>(path, {
      ...options,
      body: serializeBody(body),
      method: "PATCH",
    });
  },
  delete<T>(path: string, options?: Omit<RequestInit, "method">): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
  request,
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
    throw await createApiClientError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return parseJsonSafely<T>(response);
}

async function createApiClientError(response: Response): Promise<ApiClientError> {
  const fallback = `Request failed with status ${response.status}`;
  const payload = await parseJsonSafely<Partial<ApiErrorResponse>>(response);
  const message = payload?.error?.message || payload?.message || fallback;
  const code = payload?.error?.code;

  return new ApiClientError(message, response.status, code);
}

async function parseJsonSafely<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function serializeBody(body: unknown): RequestBody {
  if (body == null) {
    return body;
  }

  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    typeof body === "string" ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  return JSON.stringify(body);
}
